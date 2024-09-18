const getTokenFromPersistUser = () => {
  const persistRoot = localStorage.getItem("persist:root");

  if (persistRoot) {
    const parsedData = JSON.parse(persistRoot);

    const userData = JSON.parse(parsedData.user);

    const token = userData.currentUser?.token;

    return token;
  } else {
    console.log("No data found in localStorage for 'persist:root'");
    return null;
  }
};

export default getTokenFromPersistUser;
