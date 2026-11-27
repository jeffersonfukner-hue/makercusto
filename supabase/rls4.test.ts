// Migração de marcas e cores, em Postgres local (PGlite).
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'

const A = '00000000-0000-0000-0000-00000000000a'
const B = '00000000-0000-0000-0000-00000000000b'
let db: PGlite
const mig = (f: string) => readFileSync(new URL(`./migrations/${f}`, import.meta.url), 'utf8')

async function as(user: string | null) {
  await db.exec('reset role')
  if (user) { await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [user]); await db.exec('set role authenticated') }
  else { await db.query(`select set_config('request.jwt.claim.sub', '', false)`); await db.exec('set role anon') }
}
const rejects = async (p: Promise<unknown>) => { try { await p } catch { return true } return false }
const count = async (t: string) => Number((await db.query<{ n: string }>(`select count(*) n from public.${t}`)).rows[0].n)
const marca = (u: string, nome = 'Voolt3D', bico: number | null = null, mesa: number | null = null) =>
  db.query('insert into public.marcas (user_id, nome, temp_bico, temp_mesa) values ($1,$2,$3,$4)', [u, nome, bico, mesa])
const cor = (u: string, nome = 'Azul Bebê') => db.query('insert into public.cores (user_id, nome) values ($1,$2)', [u, nome])

beforeAll(async () => {
  db = new PGlite()
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated; grant usage on schema public to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    insert into auth.users values ('${A}'), ('${B}');
  `)
  await db.exec(mig('20261127150000_filamentos_produtos_impressoras.sql'))
  await db.exec(mig('20261127180000_fornecedores_insumos_espera.sql'))
  await db.exec(mig('20261127200000_marcas_cores.sql'))
})

describe.each(['marcas', 'cores'] as const)('%s: segurança por usuário', (t) => {
  const make = (u: string) => (t === 'marcas' ? marca(u) : cor(u))
  it('cada pessoa vê só o que é dela', async () => {
    await as(A); await make(A); await as(B); await make(B)
    expect(await count(t)).toBe(1)
  })
  it('não cria em nome de outra pessoa, não altera nem exclui o alheio, anônimo não lê', async () => {
    await as(A); expect(await rejects(make(B))).toBe(true)
    await as(B); await db.query(`update public.${t} set nome = 'invadido'`); await db.query(`delete from public.${t} where user_id = $1`, [A])
    await as(A); expect(await count(t)).toBe(1)
    expect((await db.query<{ nome: string }>(`select nome from public.${t}`)).rows[0].nome).not.toBe('invadido')
    await as(null); expect(await rejects(db.query(`select * from public.${t}`))).toBe(true)
  })
})

describe('regras de dados', () => {
  it('nome repetido (mesmo com outra maiúscula) é recusado, mas outra pessoa pode ter o mesmo nome', async () => {
    await as(A)
    expect(await rejects(marca(A, 'VOOLT3D'))).toBe(true)
    expect(await rejects(cor(A, 'azul bebê'))).toBe(true)
    await as(B); await marca(B, 'Nova Marca'); await as(A); await db.exec('reset role')
    await as(B); await marca(B, 'Outra'); expect(await count('marcas')).toBeGreaterThan(1)
  })
  it('nome vazio ou longo e temperaturas fora do limite são recusados', async () => {
    await as(A)
    expect(await rejects(marca(A, ''))).toBe(true)
    expect(await rejects(marca(A, 'x'.repeat(31)))).toBe(true)
    expect(await rejects(cor(A, 'y'.repeat(31)))).toBe(true)
    expect(await rejects(marca(A, 'Quente', 600, 60))).toBe(true)
    expect(await rejects(marca(A, 'Quente2', 210, 250))).toBe(true)
    await marca(A, 'Morna', 210, 60)
  })
  it('limite de 100 marcas e 100 cores por pessoa', async () => {
    await as(B)
    const have = await count('marcas')
    for (let i = have; i < 100; i++) await marca(B, `m${i}`)
    expect(await rejects(marca(B, 'extra'))).toBe(true)
    const haveC = await count('cores')
    for (let i = haveC; i < 100; i++) await cor(B, `c${i}`)
    expect(await rejects(cor(B, 'extra'))).toBe(true)
  })
})
