// Migração de fornecedores, insumos, marca/temperatura e lista de espera, em Postgres local (PGlite).
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
const forn = (u: string, nome = 'Masterprint') => db.query('insert into public.fornecedores (user_id, nome) values ($1,$2)', [u, nome])
const ins = (u: string, nome = 'Copo', qtd = 10, custo = 1250) => db.query('insert into public.insumos (user_id, nome, qtd, custo_centavos) values ($1,$2,$3,$4)', [u, nome, qtd, custo])

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
})

describe.each(['fornecedores', 'insumos'] as const)('%s: segurança por usuário', (t) => {
  const make = (u: string) => (t === 'fornecedores' ? forn(u) : ins(u))
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
  it('insumo: quantidade e custo válidos, e a pessoa ajusta a própria quantidade', async () => {
    await as(A)
    expect(await rejects(ins(A, 'x', -1))).toBe(true)
    expect(await rejects(ins(A, 'x', 1, -5))).toBe(true)
    expect(await rejects(ins(A, '', 1, 5))).toBe(true)
    await db.query(`update public.insumos set qtd = 3`)
    expect((await db.query<{ qtd: number }>('select qtd from public.insumos')).rows[0].qtd).toBe(3)
  })
  it('filamento: marca e temperaturas, com limites', async () => {
    await as(A)
    const base = `insert into public.filamentos (user_id, nome, material, preco_centavos, peso_g, comprado_em, marca, temp_bico, temp_mesa) values ($1,'PLA','PLA',6800,1000,'2026-11-20',$2,$3,$4)`
    await db.query(base, [A, 'Masterprint', 210, 60])
    expect(await rejects(db.query(base, [A, 'x'.repeat(31), 210, 60]))).toBe(true)
    expect(await rejects(db.query(base, [A, 'ok', 600, 60]))).toBe(true)
    expect(await rejects(db.query(base, [A, 'ok', 210, 250]))).toBe(true)
  })
  it('limites por pessoa: 50 fornecedores e 200 insumos', async () => {
    await as(B)
    for (let i = 0; i < 49; i++) await forn(B, `f${i}`)
    expect(await rejects(forn(B, 'extra'))).toBe(true)
    for (let i = 0; i < 199; i++) await ins(B, `i${i}`)
    expect(await rejects(ins(B, 'extra'))).toBe(true)
  })
})

describe('lista de espera', () => {
  const join = (e: string) => db.query('insert into public.lista_espera (email) values ($1)', [e])
  it('visitante entra com e-mail válido e não consegue ler a lista', async () => {
    await as(null)
    await join('pessoa@exemplo.com')
    expect(await rejects(db.query('select * from public.lista_espera'))).toBe(true)
    expect(await rejects(db.query(`update public.lista_espera set email = 'x@y.com'`))).toBe(true)
    expect(await rejects(db.query('delete from public.lista_espera'))).toBe(true)
  })
  it('recusa e-mail inválido e repetido', async () => {
    await as(null)
    expect(await rejects(join('sem-arroba'))).toBe(true)
    expect(await rejects(join('a@b'))).toBe(true)
    expect(await rejects(join('pessoa@exemplo.com'))).toBe(true)
  })
  it('quem está logado também pode entrar, mas igualmente não lê', async () => {
    await as(A); await join('logado@exemplo.com')
    expect(await rejects(db.query('select * from public.lista_espera'))).toBe(true)
  })
})
