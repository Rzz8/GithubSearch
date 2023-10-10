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
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState({ show: false, msg: "" });

  const searchGithubUser = async (user) => {
    // whenever we search user, we reset the error to none
    setError({ show: false, msg: "" });
    setIsLoading(true);

    // use axios to fetch data
    const response = await axios(`${rootUrl}/users/${user}`).catch((error) =>
      console.log(error)
    );

    if (response) {
      setGithubUser(response.data);
      const { login, followers_url } = response.data;

      await Promise.allSettled([
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ])
        .then((results) => {
          const [repos, followers] = results; // destructuring the results into 2 arrays

          if (repos.status === "fulfilled") {
            setRepos(repos.value.data);
          }

          if (followers.status === "fulfilled") {
            setFollowers(followers.value.data);
          }
        })
        .catch((error) => console.log(error));
    } else {
      setError({ show: true, msg: "the input user does not exist" });
    }
    checkRequests();
    setIsLoading(false);
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
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubContext, GithubProvider };
