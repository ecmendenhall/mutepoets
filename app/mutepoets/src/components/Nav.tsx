import { Link, useLocation } from "react-router-dom";

interface Props {
  path: string;
  text: string;
}

const NavItem = ({ path, text }: Props) => {
  const { pathname } = useLocation();

  const background = path === pathname ? "bg-gray-200" : "hover:text-gray-700";
  const className = `px-4 py-1 ${background}`;

  return (
    <Link to={path}>
      <li className={className}>{text}</li>
    </Link>
  );
};

const Nav = () => {
  return (
    <div className="flex flex-row justify-center">
      <div className="mb-8 font-body text-l cursor-pointer max-w-max">
        <ul className="flex flex-row p-2 bg-gray-100 justify-center shadow">
          <NavItem path="/vows" text="Vows" />
          <NavItem path="/claim" text="Claim" />
          <NavItem path="/about" text="About" />
        </ul>
      </div>
    </div>
  );
};

export default Nav;
