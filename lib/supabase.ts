import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pprdhurcpoddngkmpywd.supabase.co';
// This is the public anonymous key. It is safe to be exposed in a browser.
// Row Level Security (RLS) should be enabled in your Supabase project to secure your data.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcmRodXJjcG9kZG5na21weXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NDY5NTIsImV4cCI6MjA3MTUyMjk1Mn0.Uk-i8g_nnOuHYH7iL9Yti6hrxHnu1QqDGReNi12dTqA';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Helper to convert data URL to file object, useful for handling file uploads to Supabase Storage.
export const dataURLtoFile = (dataurl: string, filename: string): File => {
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