interface Props {
  color: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button = ({ color, children, onClick }: Props) => {
  const buttonClass = `font-display font-black uppercase text-l px-4 py-2 shadow bg-${color}-100 text-${color}-800 hover:bg-${color}-300`;

  return (
    <button className={buttonClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
