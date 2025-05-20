import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className=" bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/LogoPandaCare.png"
            alt="PandaCare Logo"
            width={150}
            height={150}
            className="object-contain"
          />
        </Link>
      </div>
    </nav>
  );
}
