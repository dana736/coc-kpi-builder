import {google} from 'googleapis';
const auth=new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,'http://localhost:4000/oauth2callback');
const code=process.argv[2];if(!code)throw Error('Provide the OAuth code as first argument');
const {tokens}=await auth.getToken(code);
console.log('Store this refresh token ONLY in Netlify environment variables, never in code or client HTML:');
console.log(tokens.refresh_token||'No refresh token returned; ensure prompt=consent and access_type=offline.');
