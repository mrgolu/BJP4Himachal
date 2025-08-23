import React from 'react';
import type { SocialLinks } from '../types';
import type { UserRole } from '../App';

interface FooterProps {
  links: SocialLinks;
  onAdminClick: () => void;
  userRole: UserRole;
}

const FacebookIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.011 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.316 1.363.364 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.316-2.427.364-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.316-1.363-.364-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049 1.064.218 1.791.465 2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.316 2.427-.364C9.79 2.01 10.145 2 12.315 2zm0 1.623c-2.387 0-2.691.01-3.633.058-1.002.045-1.504.207-1.857.344-.467.182-.86.399-1.249.787-.389.389-.605.782-.787 1.25-.137.353-.3.855-.344 1.857-.048.942-.058 1.246-.058 3.633s.01 2.691.058 3.633c.045 1.002.207 1.504.344 1.857.182.466.399.86.787 1.249.389.389.782.605 1.25.787.353.137.855.3 1.857.344.942.048 1.246.058 3.633.058s2.691-.01 3.633-.058c1.002-.045 1.504-.207 1.857-.344.467-.182.86-.399 1.249-.787.389.389.605-.782.787-1.25.137-.353.3-.855-.344-1.857.048-.942.058-1.246.058-3.633s-.01-2.691-.058-3.633c-.045-1.002-.207-1.504-.344-1.857a3.27 3.27 0 00-.787-1.249 3.27 3.27 0 00-1.249-.787c-.353-.137-.855-.3-1.857-.344-.942-.048-1.246-.058-3.633-.058zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 5.823a2.073 2.073 0 110-4.146 2.073 2.073 0 010 4.146zM18.23 6.94a1.2 1.2 0 10-2.4 0 1.2 1.2 0 002.4 0z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const AdminIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
    </svg>
)

const Footer: React.FC<FooterProps> = ({ links, onAdminClick, userRole }) => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4 mt-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} BJP Himachal Pradesh. All rights reserved.</p>
        <div className="flex items-center space-x-6 mt-4 sm:mt-0">
          {links.fb && (
            <a href={links.fb} target="_blank" rel="noopener noreferrer" className="hover:text-bjp-orange transition-colors">
              <span className="sr-only">Facebook</span>
              <FacebookIcon />
            </a>
          )}
          {links.insta && (
            <a href={links.insta} target="_blank" rel="noopener noreferrer" className="hover:text-bjp-orange transition-colors">
              <span className="sr-only">Instagram</span>
              <InstagramIcon />
            </a>
          )}
          {links.x && (
            <a href={links.x} target="_blank" rel="noopener noreferrer" className="hover:text-bjp-orange transition-colors">
              <span className="sr-only">X</span>
              <XIcon />
            </a>
          )}
          {userRole === 'admin' && (
            <>
              <div className="border-l border-gray-600 h-6"></div>
              <button onClick={onAdminClick} className="hover:text-bjp-orange transition-colors" aria-label="Admin Settings">
                <span className="sr-only">Admin Settings</span>
                <AdminIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;