// Testa a migração e as regras de segurança em um Postgres local (PGlite), com um auth.uid() simulado.
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { beforeAll, describe, expect, it } from 'vitest'

const A = '00000000-0000-0000-0000-00000000000a'
const B = '00000000-0000-0000-0000-00000000000b'
const entrada = JSON.stringify({ grams: 50, hours: 3 })
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
const insert = (user: string, nome = 'x') =>
  db.query('insert into public.calculos (user_id, nome, entrada) values ($1, $2, $3::jsonb)', [user, nome, entrada])
const rejects = async (p: Promise<unknown>) => { try { await p } catch { return true } return false }

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
  await db.exec(readFileSync(new URL('./migrations/20261127120000_calculos.sql', import.meta.url), 'utf8'))
})

describe('calculos: segurança por usuário', () => {
  it('cada pessoa cria e vê o próprio cálculo', async () => {
    await as(A); await insert(A, 'do A')
    const r = await db.query<{ nome: string }>('select nome from public.calculos')
    expect(r.rows.map((x) => x.nome)).toEqual(['do A'])
  })
  it('outra pessoa não vê, não altera e não exclui', async () => {
    await as(B)
    expect((await db.query('select * from public.calculos')).rows).toHaveLength(0)
    expect((await db.query(`update public.calculos set nome = 'hack'`)).affectedRows).toBe(0)
    expect((await db.query('delete from public.calculos')).affectedRows).toBe(0)
    await as(A)
    expect((await db.query<{ nome: string }>('select nome from public.calculos')).rows[0].nome).toBe('do A')
  })
  it('não dá para criar em nome de outra pessoa nem mover o cálculo para ela', async () => {
    await as(B)
    expect(await rejects(insert(A))).toBe(true)
    await as(A)
    expect(await rejects(db.query('update public.calculos set user_id = $1', [B]))).toBe(true)
  })
  it('quem não está logado não acessa nada', async () => {
    await as(null)
    expect(await rejects(db.query('select * from public.calculos'))).toBe(true)
    expect(await rejects(insert(A))).toBe(true)
  })
  it('valida nome e tamanho dos dados', async () => {
    await as(B)
    expect(await rejects(insert(B, ''))).toBe(true)
    expect(await rejects(insert(B, 'x'.repeat(61)))).toBe(true)
    expect(await rejects(db.query(`insert into public.calculos (nome, entrada) values ('a', '[]'::jsonb)`))).toBe(true)
    expect(await rejects(db.query(`insert into public.calculos (nome, entrada) values ('a', $1::jsonb)`, [JSON.stringify({ x: 'y'.repeat(5000) })]))).toBe(true)
  })
  it('o user_id vem do login quando não é informado', async () => {
    await as(B)
    await db.query(`insert into public.calculos (nome, entrada) values ('sem id', $1::jsonb)`, [entrada])
    expect((await db.query<{ user_id: string }>(`select user_id from public.calculos where nome = 'sem id'`)).rows[0].user_id).toBe(B)
  })
  it('limite de 50 cálculos por pessoa', async () => {
    await as(B)
    const have = (await db.query<{ n: number }>('select count(*)::int as n from public.calculos')).rows[0].n
    for (let i = have; i < 50; i++) await insert(B, 'n' + i)
    expect(await rejects(insert(B, 'excedente'))).toBe(true)
    await as(A)
    await insert(A, 'A ainda pode')
  })
})
