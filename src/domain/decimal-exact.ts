/** Decimal exato para quantidades/custos P06; sem ponto flutuante binário. */
export type Rational={numerator:bigint;denominator:bigint};
export function parseExactDecimal(value:string):Rational{
 const input=value.trim();
 if(!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(input)||input.length>64){
  throw new Error('Número decimal não negativo inválido.');
 }
 const [whole,fraction='']=input.split('.');
 if(whole.length>15||fraction.length>18){
  throw new Error('Magnitude ou precisão decimal não suportada.');
 }
 const den=10n**BigInt(fraction.length);
 const num=BigInt(whole)*den+BigInt(fraction||'0');
 return reduceRational({numerator:num,denominator:den});
}
export function reduceRational(value:Rational):Rational{
 if(value.denominator<=0n||value.numerator<0n)throw new Error('Razão inválida.');
 let a=value.numerator,b=value.denominator;
 while(b!==0n){const next=a%b;a=b;b=next;}
 return {numerator:value.numerator/a,denominator:value.denominator/a};
}
export function multiplyDivide(amount:Rational,quantity:Rational,base:Rational):Rational{
 if(base.numerator===0n)throw new Error('Quantidade original zero não permite custo.');
 return reduceRational({
  numerator:amount.numerator*quantity.numerator*base.denominator,
  denominator:amount.denominator*quantity.denominator*base.numerator
 });
}
export function roundPositiveCentsHalfUp(value:Rational):bigint{
 if(value.numerator<0n||value.denominator<=0n)throw new Error('Valor não positivo inválido.');
 return (value.numerator*200n+value.denominator)/(2n*value.denominator);
}
