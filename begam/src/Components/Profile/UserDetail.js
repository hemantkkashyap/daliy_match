import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faArrowRightLong,
  faAward,
  faCheck,
  faCircle,
  faCoins,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { participents, updateUserEmail } from "../../api/api";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import Notification from "../atoms/notification";
import Spinner from "../atoms/Spinner";

export default function UserDetail(props) {
  // Define ITEMS_PER_PAGE if not already defined
  const ITEMS_PER_PAGE = 5;
  const { user } = props;
  // State for managing tournaments
  const [loading, setLoading] = useState(false);
  const [showemail, setShowemail] = useState(false);
  const [userTournaments, setUserTournaments] = useState([]);
  const token = useSelector((state) => state.token);
  const updatedAt = dayjs(user.user.updatedAt);
  const [notifications, setNotifications] = useState([]); // State for notifications
  // State to manage the visibility of all tournaments
  const [showAllTournaments, setShowAllTournaments] = useState(false);
  const [newemail, setNewemail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the number of pages
  const totalPages = Math.ceil(userTournaments.length / ITEMS_PER_PAGE);

  const daysAgo = dayjs().diff(updatedAt, "day");
  const navigate = useNavigate();
  // State variables to manage editable state and form data
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({
    name: user.user.name,
    email: user.user.email,
    phoneNumber: user.user.phoneNumber,
  });

  // Function to handle edit button click
  const handleEditClick = () => {
    setShowemail(!showemail);
  };

  const handleInputChange = (e) => {
    setNewemail(e.target.value); // Update the newEmail state with input value
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    console.log("New email:", newemail); 
    // You can make an API call here to update the user details on the server
    try {
      setLoading(true);
      const res = await updateUserEmail(newemail, token);
      setLoading(false);
      console.log(res);
      navigate("/verify", { state: { email: newemail } });
    } catch (error) {
      setNotifications([{ type: "error", message: "Error Occured!!!" }]);
    } finally {
      setLoading(false);
    }

    // Disable editing after submitting
    setIsEditable(false);
  };

  const fetchUserTournaments = async () => {
    try {
      const res = await participents(token);
      // Assuming `res.data` contains the list of participants
      const participants = res.data;

      // Filter tournaments where the user ID matches
      const filteredTournaments = participants.filter(
        (participant) => participant.userId._id === user.user._id
      );
      setUserTournaments(filteredTournaments); // Update the state
      console.log("Filtered Tournaments:", userTournaments);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUserTournaments();
  }, [token, user.user._id]);
  // Render nothing if user data is not available

  // Filter upcoming tournaments
  const upcomingTournaments = userTournaments.filter((tournament) => {
    return dayjs(tournament.tournamentStateId.startDateTime).isAfter(dayjs());
  });

  // Toggle function for showing all tournaments or only upcoming
  const handleToggleView = () => {
    setShowAllTournaments(!showAllTournaments);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <Spinner />;
  }

  // Get the tournaments for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTournaments = userTournaments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => {
      if (direction === "next") {
        return Math.min(prevPage + 1, totalPages);
      } else {
        return Math.max(prevPage - 1, 1);
      }
    });
  };

  return (
    <>
      <div className="notification-container">
        {notifications.map((notification, index) => (
          <Notification
            key={index}
            type={notification.type}
            message={notification.message}
          />
        ))}
      </div>
      <section id="all-trophies" className="pb-120">
        <div className="container">
          <div className="tab-content">
            <div
              className="tab-pane fade show active"
              role="tabpanel"
              aria-labelledby="overview-tab"
              style={{ display: "flex", alignItems: "space-between" }}
            >
              <div className="statistics-area">
                <div className="row">
                  <div className="col-lg-9">
                    <div
                      className="total-area"
                      style={{ marginBottom: "30px" }}
                    >
                      <div className="head-area d-flex justify-content-between">
                        <div className="left">
                          <h5>Personal Details</h5>
                        </div>
                        <div class="right">
                          <p class="text-sm">
                            Last Update: <span>{daysAgo} days ago</span>
                          </p>
                        </div>
                        <div className="right" style={{ color: "white" }}>
                          <FontAwesomeIcon
                            icon={faEdit}
                            onClick={handleEditClick  }
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      </div>
                      <div className="tab-content" id="myTabContents">
                        <div
                          className="tab-pane fade show active"
                          id="fortnite"
                          role="tabpanel"
                          aria-labelledby="fortnite-tab"
                        >
                          <div className="row">
                            <div
                              className="col-lg-12 col-md-12"
                              style={{ paddingTop: "15px" }}
                            >
                              <div className="profile-input">
                                <label htmlFor="name">Name</label>
                                <input
                                  id="name"
                                  type="text"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  readOnly={!isEditable}
                                />
                              </div>
                              <div className="profile-input">
                                <label htmlFor="email">Email</label>
                                <input
                                  id="email"
                                  type="text"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  readOnly={!isEditable}
                                />
                              </div>
                              <div className="profile-input">
                                <label htmlFor="phone">Phone</label>
                                <input
                                  id="phoneNumber"
                                  type="text"
                                  value={formData.phoneNumber}
                                  onChange={handleInputChange}
                                  readOnly={!isEditable}
                                />
                              </div>
                              <div style={{ height: "45px" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="statistics-area">
                <div class="row">
                  <div class="col-lg-9">
                    <div class="total-area">
                      <div class="head-area d-flex justify-content-between">
                        <div class="left">
                          <h5>Game Statistics</h5>
                          <p class="text-sm">
                            Player's game specific statistics
                          </p>
                        </div>
                      </div>
                      <div class="tab-content" id="myTabContents">
                        <div
                          class="tab-pane fade show active"
                          id="fortnite"
                          role="tabpanel"
                          aria-labelledby="fortnite-tab"
                        >
                          <div class="row">
                            <div class="col-lg-4 col-md-6">
                              <div class="single-item text-center">
                                <img
                                  src="images/statistics-icon-1.png"
                                  alt="image"
                                />
                                <p>Tournaments Played</p>
                                <h4>
                                  {
                                    user.TournamentDetails
                                      .tournamentsParticipated
                                  }
                                </h4>
                              </div>
                            </div>
                            <div class="col-lg-4 col-md-6">
                              <div class="single-item text-center">
                                <FontAwesomeIcon
                                  icon={faCoins}
                                  style={{ fontSize: "45px", color: "white" }}
                                />
                                <p>
                                  Times
                                  <br /> Paid
                                </p>
                                <h4>
                                  {user.TournamentDetails.totalPrizeMoney}
                                </h4>
                              </div>
                            </div>
                            <div class="col-lg-4 col-md-6">
                              <div class="single-item text-center">
                                <FontAwesomeIcon
                                  icon={faAward}
                                  style={{ fontSize: "45px", color: "white" }}
                                />
                                <p>
                                  Tournaments
                                  <br /> Won
                                </p>
                                <h4>
                                  {user.TournamentDetails.firstPlaceCount}
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="user-tournaments">
            <div className="statistics-area">
              <div className="row">
                <div className="col-lg-6">
                  <div className="total-area">
                    <div className="head-area d-flex justify-content-between">
                      <div className="left">
                        <h5>Your Tournaments</h5>
                      </div>
                    </div>
                    <div className="tab-content" id="myTabContents">
                      <div
                        className="tab-pane fade show active"
                        id="fortnite"
                        role="tabpanel"
                        aria-labelledby="fortnite-tab"
                      >
                        <div className="row">
                          <div className="col-lg-12 col-md-12">
                            <div>
                              {currentTournaments.map((tournament) => (
                                <div
                                  className="usertournament"
                                  key={tournament._id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faCircle}
                                    style={{ color: "white" }}
                                  />
                                  <p>
                                    {
                                      tournament.tournamentStateId.tournamentId
                                        .name
                                    }
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {totalPages > 1 && (
                      <div className="pagination-controls d-flex justify-content-between">
                        <button
                          onClick={() => handlePageChange("previous")}
                          disabled={currentPage === 1}
                        >
                          <FontAwesomeIcon icon={faArrowLeftLong} />
                        </button>
                        <span>{`${currentPage} of ${totalPages}`}</span>
                        <button
                          onClick={() => handlePageChange("next")}
                          disabled={currentPage === totalPages}
                        >
                          <FontAwesomeIcon icon={faArrowRightLong} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showemail && (
        <div className="changeemail">
          <div className="close" onClick={handleEditClick}>
            &times;
          </div>
          <form className="email-contanier" onSubmit={handleSubmit}>
            <p>Update Email</p>
            <input
              type="email"
              placeholder="Enter Your New Email"
              value={newemail} // Bind the input value to newEmail state
              onChange={handleInputChange} // Update the state on input change
              required
            />
            <button className="cmn-btn" type="submit" style={{ color: "white" }}>
              Submit
            </button>
          </form>
        </div>
      )}
     
    </>
  );
}
