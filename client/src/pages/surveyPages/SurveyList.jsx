/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from "react";
import _ from "lodash";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "../../services/axios";
import SurveyListItem from "../../components/surveyPage/SurveyListItem";
import notify from "../../services/notifyService";
import Loading from "../../components/Loading";

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const { getIdTokenClaims } = useAuth0();

  useEffect(async () => {
    try {
      const res = await axios.get("/api/surveys");
      setSurveys(res.data);

      const claims = await getIdTokenClaims();
      if (claims) setIsAdmin(claims["https://it-project-connected.herokuapp.com/roles"] === "admin");
      else setIsAdmin(false);

      setIsLoading(false);
    } catch (e) {
      notify.errorNotify(e.message);
    }
  }, []);

  const updateSurvey = async (id, changes) => {
    const index = _.findIndex(surveys, { _id: id });
    const { data } = await axios.put(`http://localhost:3000/api/surveys/${id}`, changes);
    const survey = _.pick(data, ["_id", "title", "thumbnail", "updatedAt", "visible"]);
    const newSurveys = [...surveys];
    newSurveys[index] = survey;
    setSurveys(newSurveys);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="sl-container">
      <div className="sl__content">
        <ul>
          {surveys.map((s) => (
            <SurveyListItem key={s.updatedAt} survey={s} isAdmin={isAdmin} updateSurvey={updateSurvey} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SurveyList;
