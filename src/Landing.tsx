import { useState } from 'react'
import { cloud } from './supabase'

export function LandingHero() {
  return (
    <section className="lhero">
      <h1>Quanto custa de verdade cada peça impressa em 3D?</h1>
      <p className="lead">Some filamento, energia, máquina, seu tempo e as falhas em segundos e descubra o preço que dá lucro. Sem cadastro, direto no navegador.</p>
    </section>
  )
}

function Waitlist() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'ok' | 'erro'>('idle')
  const [msg, setMsg] = useState('')
  if (!cloud) return null
  const join = async () => {
    try { await cloud!.waitlist.join(email); setState('ok'); setMsg('Pronto. Avisamos você por e-mail quando o plano com conta abrir.') }
    catch (e) { setState('erro'); setMsg((e as Error).message) }
  }
  return (
    <form className="wait" onSubmit={(e) => { e.preventDefault(); void join() }} noValidate>
      <label><span>Seu e-mail</span>
        <span className="input"><input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" /></span></label>
      <button type="submit" className="primary">Quero ser avisado</button>
      {msg && <p className={state === 'erro' ? 'errors' : 'note'} role="status">{msg}</p>}
      <small>Usamos o e-mail só para avisar sobre o plano com conta. Nada de spam.</small>
    </form>
  )
}

export function LandingSections() {
  return (
    <div className="landing">
      <section>
        <h2>O que a calculadora faz por você</h2>
        <div className="three-cards">
          <div className="card"><h3>Mostra para onde vai o custo</h3><p>Filamento, purga e torre das trocas de cor, energia, desgaste da máquina, seu tempo e as falhas, tudo separado.</p></div>
          <div className="card"><h3>Produto de várias partes</h3><p>Caneca com 4 impressões, várias cores e itens comprados como o copo de alumínio: o custo do produto fecha de ponta a ponta.</p></div>
          <div className="card"><h3>Seus preços de verdade</h3><p>Cadastre cada rolo com o preço que você pagou, cada fornecedor e sua impressora. O custo muda quando o preço muda.</p></div>
        </div>
      </section>
      <section>
        <h2>Planos</h2>
        <div className="plans">
          <div className="card">
            <h3>Grátis</h3>
            <ul>
              <li>Calculadora no modo básico e avançado</li>
              <li>Produto com partes, filamentos, fornecedores, impressoras e estoque</li>
              <li>Tudo salvo no seu navegador</li>
            </ul>
          </div>
          <div className="card plan-pro">
            <h3>Com conta <span className="tag">em breve</span></h3>
            <ul>
              <li>Salvar na nuvem e acessar de qualquer aparelho</li>
              <li>Seus dados protegidos pela sua conta Google</li>
              <li>Novos recursos primeiro: clientes e pedidos</li>
            </ul>
            <Waitlist />
          </div>
        </div>
      </section>
    </div>
  )
}
