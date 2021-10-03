interface Props {
  children: React.ReactNode;
}

const Grid = ({ children }: Props) => {
  return (
    <div className="grid gap-0 grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-11 mb-8">
      {children}
    </div>
  );
};

export default Grid;
