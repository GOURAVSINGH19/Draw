import Link from "next/link";
// import { getSession } from "./lib/getSession";
import { Button } from "@workspace/ui/components/button"
import { ReactElement } from "react";
const Navbar = async (): Promise<ReactElement> => {
  // const session = await getSession();
  // const user = session?.user;

  return (
    <nav className="flex justify-around items-center py-4 bg-[#141414] text-white">
      <Link href="/" className="text-xl font-bold">
        My Facny Website
      </Link>

      <ul className="hidden md:flex space-x-4 list-none">
        {/* {!user ? (
          <>
            <li>
              <Link href="/login" className="hover:text-gray-400">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-gray-400">
                Register
              </Link>
            </li>
          </>
        ) : (
          <>
            <li className="mt-2">
              <Link href="/private/dashboard" className="hover:text-gray-400">
                Dashboard
              </Link>
            </li>

            <form
              action={async () => {
                "use server";
              }}
            >
              <Button type="submit" variant={"ghost"}>
                Logout
              </Button>
            </form>
          </>
        )} */}
      </ul>
    </nav>
  );
};

export default Navbar;