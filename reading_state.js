(function () {
  const STORAGE_KEY = "oriental_destiny_reading_state";

  function read() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function write(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage issues in static preview mode.
    }
  }

  function merge(data) {
    const next = { ...read(), ...data };
    write(next);
    return next;
  }

  function fromQuery() {
    const params = new URLSearchParams(window.location.search);
    const data = {};
    ["focus", "full_name", "birth_date", "birth_time", "notes", "carrier", "gender", "birth_location"].forEach((key) => {
      const value = params.get(key);
      if (value) data[key] = value;
    });
    return data;
  }

  function toQuery(data) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }

  window.ReadingState = {
    read,
    write,
    merge,
    fromQuery,
    toQuery
  };
})();
