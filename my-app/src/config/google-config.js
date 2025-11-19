
export const GOOGLE_CLIENT_ID = '1088735714189-4ojrl1hq9qvoi6v91r2ue6cojhejfjkn.apps.googleusercontent.com';

export const GOOGLE_OAUTH_CONFIG = {
  client_id: GOOGLE_CLIENT_ID,
  auto_select: false,
  cancel_on_tap_outside: false,
  context: 'signin',
  ux_mode: 'popup',
  callback: 'handleGoogleLogin'
};