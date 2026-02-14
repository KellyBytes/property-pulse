const PropertyPage = async ({ params, searchParams }) => {
  const { id } = await params;
  const { name } = await searchParams;

  return (
    <div>
      <div>Property ID: {id}</div>
      <div>Property Name: {name}</div>
    </div>
  );
};
export default PropertyPage;
