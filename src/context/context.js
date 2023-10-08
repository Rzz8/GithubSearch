import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);

  const [requests, setRequests] = useState(0);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState({ show: false, msg: "" });

  const searchGithubUser = async (user) => {
    const response = await axios(`${rootUrl}/users/${user}`).catch((error) =>
      console.log(error)
    );

    console.log(response);
    if (response) {
      setGithubUser(response.data);
    } else {
      setError({ show: true, msg: "the input user does not exist" });
    }
  };

  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;
        setRequests(remaining);
        if (remaining === 0) {
          setError({
            show: true,
            msg: "Sorry, you have reached the search limit!",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(checkRequests, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubContext, GithubProvider };
