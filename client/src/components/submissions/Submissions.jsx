import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
// import Container from "react-bootstrap/Container";

import PropTypes from "prop-types";
import qs from "query-string";
import http from "../../services/httpService";
import Pair from "./Pair";

export default function Submissions({ location }) {
  const [isLoading, setIsLoading] = useState(true);
  const [survey, setSurvey] = useState({});
  const [qrPair, setQrPair] = useState({});
  const query = qs.parse(location.search);
  const history = useHistory();

  useEffect(async () => {
    try {
      const { data: surveyData } = await http.get(`http://localhost:3000/api/surveys/${query.survey}`);
      const { data: submissionsDate } = await http.get(`http://localhost:3000/api/submissions/?survey=${query.survey}`);

      const pairs = {};

      surveyData.questions.forEach((q) => {
        pairs[q.name] = [];
      });

      submissionsDate.forEach((s) => {
        s.responses.forEach((r) => {
          pairs[r.name].push(r.response);
        });
      });

      setSurvey(surveyData);
      setQrPair(pairs);
      setIsLoading(false);
    } catch (e) {
      // TODO: redirect to not found page
      if (e.response.status === 404) {
        history.push("/");
      }
    }
  }, []);

  return (
    <div className="sb-container">
      {!isLoading && (
        <div className="sb__content">
          <h3>{survey.title}</h3>
          <h5>{survey.description}</h5>
          {Object.keys(qrPair).map((question) => (
            <Pair question={survey.questions.filter((q) => q.name === question)[0]} responses={qrPair[question]} />
          ))}
        </div>
      )}
    </div>
  );
}

Submissions.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};
