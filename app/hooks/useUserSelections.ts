import {
  SELECTIONS_STORAGE_KEY,
  UserSelections,
} from "../components/sidebar/models/models";

import useAppStorage from "./useAppStorage";

const useUserSelections = (key?: string) => {
  const {
    value: selections,
    store: setSelections,
    valueRead,
  } = useAppStorage<UserSelections>(key || SELECTIONS_STORAGE_KEY);

  return {
    ...selections,
    setSelections,
    loaded: valueRead,
  };
};

export default useUserSelections;
