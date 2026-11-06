import {json} from './_shared.mjs';
export default async () => {
  if(!process.env.TURNSTILE_SITE_KEY || !process.env.TURNSTILE_SECRET_KEY) return json({error:'Human verification configuration missing'},503);
  return json({turnstileSiteKey:process.env.TURNSTILE_SITE_KEY});
};
