// Compare optional filters through the normal usage tracker; never print keys or raw bodies.
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd(), true, {info(){},error(){}});
const {fetchFromProvider,providerKey}=await import('../src/lib/api/core/fetch');
const {providerDatabase}=await import('../src/lib/api/core/storage');
const {rejectNewsdataBody}=await import('../src/lib/api/news/newsdata');
try {
 for(const [label,extra] of ['reuters.com','iea.org','worldbank.org','un.org'].map(domainurl=>[domainurl,{domainurl}])){
  const params=new URLSearchParams({apikey:providerKey('newsdata')!,q:'climate',language:'en',size:'10',...extra});
  const result=await fetchFromProvider<{results?:unknown[]}>('newsdata','https://newsdata.io/api/1/latest?'+params,{fresh:true,rejectBody:rejectNewsdataBody,errorCode:body=>(body as {results?:{code?:string}})?.results?.code??null});
  console.log(JSON.stringify({case:label,...(result.ok?{ok:true,articles:result.data.results?.length??0}:{ok:false,reason:result.reason,message:result.message})}));
 }
}finally{await providerDatabase()?.end();}
