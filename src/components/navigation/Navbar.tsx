"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { NavbarHeight } from './Sizes';
import { useRouter } from "next/navigation";
import { VscSignOut } from "react-icons/vsc";
import Link from "next/link";

const Navbar = () => {
  const { data: session } = useSession();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const router = useRouter();

  const handleAvatarClick = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setIsPopupVisible(false);
    router.push("/auth/signin");
  };

  if (session?.user) {
    return (
      <div 
        className="top-0 right-0 left-0 z-50 fixed bg-primary shadow-md"
        style={{ height: `${NavbarHeight}px` }}
      >
        <div className="flex justify-between items-center mx-auto px-4 h-full container">
          <div>
            <Link 
              href={"/client"} 
              className="flex items-center gap-1 hover:opacity-80 text-white text-3xl transition-opacity"
            >
              <h3 className="text-white">Buildify</h3>
              <h3 className="text-gold">Construct</h3>
            </Link>
          </div>
          
          <div className="relative flex items-center gap-4">
            <h3 className="hidden md:block text-white">
              {session.user.firstName} {session.user.lastName} ({session.user.role})
            </h3>
            
            <div className="flex items-center gap-2">
              <div 
                className="bg-gray-400 hover:opacity-80 rounded-full w-10 h-10 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              ></div>
              
              <button
                onClick={handleSignOut}
                className="bg-red-700 hover:bg-red-800 p-2 rounded-full text-white transition-colors"
                title="Выйти"
              >
                <VscSignOut size={20}/>
              </button>
            </div>

            {/* Popup для выхода (мобильная версия) */}
            {isPopupVisible && (
              <div className="top-full right-0 z-50 absolute bg-white shadow-lg mt-2 p-3 rounded-lg">
                <p className="md:hidden mb-2 text-gray-700 text-sm">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full text-red-600 hover:text-red-800 text-sm"
                >
                  <VscSignOut size={16}/>
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Navbar;