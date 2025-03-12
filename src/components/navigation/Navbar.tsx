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
  const router = useRouter()
  const handleAvatarClick = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setIsPopupVisible(false); // Закрываем popup после выхода
    router.push("/auth/signin")
  };

  if (session?.user) {
    return (
      <div 
        style={{ height: `${NavbarHeight}px` }}
        className={`bg-primary flex justify-center`}
      >
        <div className='flex justify-between items-center container'>
          <div>
            <Link href={"/client"} className='flex items-center gap-1 text-white text-3xl'><h3 className="text-white">Buildify</h3><h3 className="text-gold">Construct</h3></Link>
          </div>
          <div className='relative flex items-center gap-5'>
            <h3 className='text-white'>{session.user.firstName} {session.user.lastName} ({session.user.role})</h3>
            <div 
              className='bg-gray-400 p-4 rounded-full cursor-pointer'
              onClick={handleAvatarClick}
            ></div>
            <button
                  onClick={handleSignOut}
                  className="bg-red-700 px-2 py-2 rounded-full text-white"
                >
                  <VscSignOut size={20}/>
                </button>
            
            {/* Popup для выхода */}
            {isPopupVisible && (
              <div className="top-12 right-0 absolute bg-white shadow-lg p-4 rounded-lg">
                <button
                  onClick={handleSignOut}
                  className="bg-red-700 text-red-500 hover:text-white-700"
                >
                  <VscSignOut />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <div>Not signed in</div>;
};

export default Navbar;