function SearchForm({
  city,
  selectedActivity,
  activityOptions,
  onCityChange,
  onActivityChange,
  onSubmit,
}) {
  return (
    <>
      <form className="search-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="city-search">
          City
        </label>

        <input
          id="city-search"
          name="city"
          type="text"
          placeholder="Enter a city, e.g. Toronto"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      <div className="activity-field">
        <label htmlFor="activity-select">Activity</label>
        <select
          id="activity-select"
          name="activity"
          value={selectedActivity}
          onChange={(event) => onActivityChange(event.target.value)}
        >
          {Object.entries(activityOptions).map(([key, activity]) => (
            <option key={key} value={key}>
              {activity.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export default SearchForm;
