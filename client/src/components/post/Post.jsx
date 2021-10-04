import { useEffect, useState } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import { Col, Container, Row, Modal } from "react-bootstrap";
import MediaQuery from "react-responsive";
// import axios from "axios";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import axios from "../../helpers/axios";
import backgroundImg from "../../assets/mainHeader.png";
import PostStats from "./PostStats";
import PostComment from "./PostComment";
import PostContent from "./PostContent";
import PostReply from "./PostReply";
import Loading from "../Loading";

const Background = styled.div`
  background-color: var(--color-background);
  min-height: calc(100vh - var(--height-nav-bar) - var(--height-footer));
  margin-top: 80px;
  padding: 0 0 8vh;
  position: relative;
`;

const StyledImage = styled.img`
  height: 350px;
  width: 100%;
  max-width: 100%;
  object-fit: cover;
  object-position: left bottom;
  @media (max-width: 480px) {
    height: 250px;
  }
`;

const StyledHeader = styled(Container)`
  margin: -20px 8vw 0;
  padding: 1.5rem 2rem;
  width: 84vw;
  font-size: 1.2rem;
  text-align: left;
  color: white;
  background-color: var(--color-primary);
  position: absolute;
  max-width: 100%;
  @media (min-width: 768px) {
    margin: -30px 12vw 0;
    width: 76vw;
    font-size: 1.5rem;
  }
  @media (min-width: 1200px) {
    margin: -30px 20vw 0;
    width: 60vw;
  }
`;

const StyledDiv = styled.div`
  margin: 0 8vw;
  padding: 80px 2rem 30px;
  border: 1px solid var(--color-primary);
  background-color: white;
  max-width: 100vw;
  @media (min-width: 768px) {
    margin: 0 12vw;
  }
  @media (min-width: 1200px) {
    margin: 0 20vw;
  }
`;

const FollowButton = styled.button`
  padding: 0.75rem 1rem;
  margin: 1rem 10%;
  max-width: 80%;
  font-size: 1.1rem;
  text-align: center;
  background-color: var(--color-primary);
  color: white;
  border: 0;
  border-radius: 0.75rem;
  &:hover {
    filter: brightness(75%);
  }
  @media (min-width: 768px) {
    padding: 1rem 1.3rem;
    font-size: 1.2rem;
  }
  @media (min-width: 1024px) {
    padding: 1rem 2rem;
    font-size: 1.3rem;
  }
`;

const SolveButton = styled(FollowButton)`
  background-color: var(--color-secondary);
  &.solved {
    background-color: var(--color-accent);
  }
`;

const DeleteButton = styled(FollowButton)`
  background-color: var(--color-accent);
`;

const ConfirmDeleteButton = styled(DeleteButton)`
  font-size: 1.1rem;
  margin: 0.25rem 0.75rem;
  padding: 0.5rem 1rem;
`;

const CancelButton = styled(ConfirmDeleteButton)`
  background-color: grey;
`;

const Post = () => {
  // const baseUrl = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL : "http://localhost:3000";
  const { id } = useParams();
  const history = useHistory();
  const { user, getIdTokenClaims, isAuthenticated } = useAuth0();
  // const isAdmin = localStorage.getItem("isAdmin");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [post, setPost] = useState();
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(async () => {
    const users = await axios.get("/api/auth0/users").then((res) => {
      console.log(res);
      return res.data;
    });
    console.log(users);
    await axios
      // .get(`${baseUrl}/api/posts/${id}`)
      .get(`/api/posts/${id}`)
      .then((res) => {
        console.log(res);
        // Increment the post view count
        // return axios.put(`${baseUrl}/api/posts/${id}`, { views: res.data.views + 1 });
        return axios.put(`/api/posts/${id}`, { views: res.data.views + 1 });
      })
      .then((res) => {
        console.log(res);
        const { data } = res;
        const postAuthor = users.find((u) => u.user_id === data.author.uid);
        console.log(postAuthor);
        data.author = {
          uid: postAuthor.user_id,
          name: postAuthor.nickname,
          picture: postAuthor.picture,
        };
        data.comments.map((comment) => {
          const commentAuthor = users.find((u) => u.user_id === comment.author.uid);
          console.log(commentAuthor);
          // eslint-disable-next-line no-param-reassign
          comment.author = {
            uid: commentAuthor.user_id,
            name: commentAuthor.nickname,
            picture: commentAuthor.picture,
          };
          return comment;
        });
        setPost(data);
      });
  }, []);

  // Check for admin status everytime when isAuthenticated changes its value
  useEffect(async () => {
    const claims = await getIdTokenClaims();
    setIsAdmin(isAuthenticated && claims["https://it-project-connected.herokuapp.com/roles"][0] === "Admin");

    if (isAuthenticated && post !== undefined) {
      setIsAuthor(post.author.uid === user.sub);
    }
  }, [isAuthenticated, post]);

  const handleFollowClick = () => {
    const { followers } = post;
    const index = followers.indexOf(user.sub);
    // eslint-disable-next-line no-unused-expressions
    index === -1 ? followers.push(user.sub) : followers.splice(index, 1);
    // axios.put(`${baseUrl}/api/posts/${id}`, { followers }).then((res) => {
    axios.put(`/api/posts/${id}`, { followers }).then((res) => {
      console.log(res);
      setPost(res.data);
    });
  };

  const handleSolveClick = () => {
    // axios.put(`${baseUrl}/api/posts/${id}`, { solved: !post.solved }).then((res) => {
    axios.put(`/api/posts/${id}`, { solved: !post.solved }).then((res) => {
      console.log(res);
      setPost(res.data);
    });
  };

  const handlePostDeleteClick = () => {
    setShowConfirmation(false);
    // axios.delete(`${baseUrl}/api/posts/${id}`).then((res) => {
    axios.delete(`/api/posts/${id}`).then((res) => {
      console.log(res);
      toast.success("Your post has been successfully deleted.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
        draggable: false,
        progress: undefined,
      });
      setTimeout(() => {
        history.push("/");
      }, 3000);
    });
  };

  const handlePublish = (reply) => {
    const comment = {
      author: {
        uid: user.sub,
        name: user.email === user.name ? user.nickname : user.name,
        picture: user.picture,
      },
      content: reply,
    };
    // axios.put(`${baseUrl}/api/posts/${id}/comment`, { comments: [comment] }).then((res) => {
    axios.put(`/api/posts/${id}/comment`, { comments: [comment] }).then((res) => {
      console.log(res);
      setPost(res.data);
    });
  };

  if (post === undefined) {
    return <Loading />;
  }
  return (
    <Background>
      <StyledImage src={backgroundImg} />
      <StyledHeader>
        <Link className="text-white" to="/">{` Question Board `}</Link>
        &nbsp;&nbsp;&nbsp;
        <FontAwesomeIcon icon="arrow-right" size="sm" color="white" />
        &nbsp;&nbsp;&nbsp;
        {post.title.length < 60 ? post.title : post.title.substring(0, 60).concat("...")}
      </StyledHeader>
      <StyledDiv>
        <Container>
          <Row>
            <Col xs="8" className="ps-4">
              <Row>
                <PostContent
                  // eslint-disable-next-line no-underscore-dangle
                  pid={post._id}
                  isAuthor={isAuthor}
                  author={post.author}
                  createdAt={post.createdAt}
                  title={post.title}
                  content={post.content}
                  history={post.history}
                  onDeleteClick={() => setShowConfirmation(true)}
                  setPost={setPost}
                  isAdmin={isAdmin}
                  sub={post.author.uid}
                />
              </Row>
              <Row>
                {post.comments.map((comment) => (
                  <PostComment
                    // eslint-disable-next-line no-underscore-dangle
                    key={comment._id}
                    // eslint-disable-next-line no-underscore-dangle
                    pid={post._id}
                    // eslint-disable-next-line no-underscore-dangle
                    cid={comment._id}
                    author={comment.author}
                    createdAt={comment.createdAt}
                    content={comment.content}
                    history={comment.history}
                    // onDeleteClick={handleCommentDeleteClick}
                    setPost={setPost}
                    sub={comment.author.uid}
                  />
                ))}
              </Row>
              <Row>
                <PostReply onPublish={handlePublish} />
              </Row>
            </Col>
            <Col xs="4">
              <Row>
                <PostStats views={post.views} comments={post.comments.length} solved={post.solved} />
              </Row>
              {/* Only show following button for authenticated users */}
              {isAuthenticated && (
                <Row>
                  <FollowButton type="button" onClick={handleFollowClick}>
                    {post.followers.includes(user.sub) ? (
                      <>
                        <FontAwesomeIcon icon="bell" size="lg" color="white" />
                        <MediaQuery minWidth={1024}>&nbsp;{` Following`}</MediaQuery>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon="bell-slash" size="lg" color="white" />
                        <MediaQuery minWidth={1024}>&nbsp;{` Unfollowed`}</MediaQuery>
                      </>
                    )}
                  </FollowButton>
                </Row>
              )}
              {/* Only show marking as solved for post owner */}
              {isAuthor && (
                <Row>
                  <SolveButton type="button" className={post.solved && "solved"} onClick={handleSolveClick}>
                    Mark as {post.solved ? " Unsolved" : " Solved"}
                  </SolveButton>
                </Row>
              )}
              {/* Only delete post for admin and post owner only */}
              {/* {(isAdmin || (isAuthenticated && post.uid === user.sub)) && ( */}
              {(isAdmin || isAuthor) && (
                <Row>
                  <DeleteButton onClick={() => setShowConfirmation(true)}>Delete Post</DeleteButton>
                </Row>
              )}
              <Modal className="vw-100" show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                <Modal.Header className="px-4" closeButton>
                  <Modal.Title>Delete Post?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-5 py-4 text-center">
                  <p className="m-0 p-1">Do you really want to permanently delete this post?</p>
                  <p className="m-0 p-1">This process cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                  <CancelButton onClick={() => setShowConfirmation(false)}>Cancel</CancelButton>
                  <ConfirmDeleteButton onClick={handlePostDeleteClick}>Delete</ConfirmDeleteButton>
                </Modal.Footer>
              </Modal>
            </Col>
          </Row>
        </Container>
      </StyledDiv>
    </Background>
  );
};

export default Post;
