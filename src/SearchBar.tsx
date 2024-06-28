const SearchBar = () => {
  return (
    <form className="d-flex">
      <input type="text" className="form-control me-2" />
      <button type="submit" className="btn btn-primary">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
