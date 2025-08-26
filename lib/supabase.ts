import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pprdhurcpoddngkmpywd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcmRodXJjcG9kZG5na21weXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE0MDY4MTgsImV4cCI6MjAzNjk4MjgxOH0.Z6g5Z4d8p1VEsBDp0t0mRnav2q_2ED0hp0o-h7a5Wp8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to convert data URL to file for uploading
export const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
};
