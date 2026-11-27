// Testa a migração de filamentos, produtos e impressoras em Postgres local (PGlite), com auth.uid() simulado.
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'

const A = '00000000-0000-0000-0000-00000000000a'
const B = '00000000-0000-0000-0000-00000000000b'
let db: PGlite

async function as(user: string | null) {
  await db.exec('reset role')
  if (user) {
    await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [user])
    await db.exec('set role authenticated')
  } else {
    await db.query(`select set_config('request.jwt.claim.sub', '', false)`)
    await db.exec('set role anon')
  }
}
const fil = (user: string, nome = 'PLA preto', preco = 6800, peso = 1000) =>
  db.query(`insert into public.filamentos (user_id, nome, material, preco_centavos, peso_g, comprado_em) values ($1,$2,'PLA',$3,$4,'2026-11-20')`, [user, nome, preco, peso])
const prod = (user: string, dados = '{"parts":[]}') => db.query('insert into public.produtos (user_id, nome, entrada) values ($1, $2, $3::jsonb)', [user, 'Caneca', dados])
const imp = (user: string) => db.query('insert into public.impressoras (user_id, nome, dados) values ($1, $2, $3::jsonb)', [user, 'Kobra X', '{"watts":150}'])
const rejects = async (p: Promise<unknown>) => { try { await p } catch { return true } return false }
const count = async (t: string) => Number((await db.query<{ n: string }>(`select count(*) n from public.${t}`)).rows[0].n)

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
  await db.exec(readFileSync(new URL('./migrations/20261127150000_filamentos_produtos_impressoras.sql', import.meta.url), 'utf8'))
})

describe.each(['filamentos', 'produtos', 'impressoras'] as const)('%s: segurança por usuário', (t) => {
  const make = (u: string) => (t === 'filamentos' ? fil(u) : t === 'produtos' ? prod(u) : imp(u))
  it('cada pessoa vê só o que é dela', async () => {
    await as(A); await make(A)
    await as(B); await make(B)
    expect(await count(t)).toBe(1)
    await as(A); expect(await count(t)).toBe(1)
  })
  it('não cria em nome de outra pessoa', async () => {
    await as(A); expect(await rejects(make(B))).toBe(true)
  })
  it('não altera nem exclui o que é de outra pessoa', async () => {
    await as(B)
    await db.query(`update public.${t} set nome = 'invadido'`)
    await db.query(`delete from public.${t} where user_id = $1`, [A])
    await as(A); expect(await count(t)).toBe(1)
    expect((await db.query<{ nome: string }>(`select nome from public.${t}`)).rows[0].nome).not.toBe('invadido')
  })
  it('quem não entrou não acessa nada', async () => {
    await as(null); expect(await rejects(db.query(`select * from public.${t}`))).toBe(true)
  })
})

describe('regras de dados e limites', () => {
  it('filamento: preço, peso e nome precisam ser válidos', async () => {
    await as(A)
    expect(await rejects(fil(A, 'x', 0))).toBe(true)
    expect(await rejects(fil(A, 'x', 6800, 0))).toBe(true)
    expect(await rejects(fil(A, '', 6800))).toBe(true)
    expect(await rejects(fil(A, 'x'.repeat(61)))).toBe(true)
  })
  it('produto: entrada precisa ser objeto e pequena', async () => {
    await as(A)
    expect(await rejects(prod(A, '[1]'))).toBe(true)
    expect(await rejects(prod(A, JSON.stringify({ x: 'a'.repeat(40000) })))).toBe(true)
  })
  it('limites por pessoa: 100 filamentos, 50 produtos, 20 impressoras', async () => {
    await as(B)
    for (let i = 0; i < 99; i++) await fil(B, `f${i}`)
    expect(await rejects(fil(B, 'extra'))).toBe(true)
    for (let i = 0; i < 49; i++) await prod(B)
    expect(await rejects(prod(B))).toBe(true)
    for (let i = 0; i < 19; i++) await imp(B)
    expect(await rejects(imp(B))).toBe(true)
    // o limite de B não bloqueia A
    await as(A); await fil(A, 'ainda cabe')
  })
})
