const headers={"Cache-Control":"no-store"};
export function GET(){return Response.json({enabled:false,reason:"public_demo"},{headers});}
export function POST(){return Response.json({error:"public_demo"},{status:403,headers});}
