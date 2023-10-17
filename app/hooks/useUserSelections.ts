import {
  SELECTIONS_STORAGE_KEY,
  UserSelections,
} from "../components/sidebar/models/models";

import useAppStorage from "./useAppStorage";

const useUserSelections = () => {
  const { value: selections, set: setSelections } =
    useAppStorage<UserSelections>(SELECTIONS_STORAGE_KEY);
  return {
    ...selections,
    setSelections,
  };
};

export default useUserSelections;
