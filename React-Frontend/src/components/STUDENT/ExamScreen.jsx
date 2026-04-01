import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../css/ExamScreen.css";

const BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL;

const ExamScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const assessment = location.state?.assessment;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [timeLeft, setTimeLeft] = useState(
    assessment?.duration ? assessment.duration * 60 : 0
  );

  const token = localStorage.getItem("token");

  // 🔥 Prevent multiple submissions
  const hasSubmittedRef = useRef(false);

  // ================= SAFETY CHECK =================
  if (
    !assessment ||
    !assessment.assessmentQuestions ||
    assessment.assessmentQuestions.length === 0
  ) {
    return <p>Loading exam...</p>;
  }

  const questions = assessment.assessmentQuestions;
  const currentQuestionObj = questions[currentIndex];

  if (!currentQuestionObj || !currentQuestionObj.question) {
    return <p>Loading question...</p>;
  }

  const current = currentQuestionObj.question;

  // ================= FULLSCREEN ENABLE =================
  useEffect(() => {
    const enterFullscreen = () => {
      const elem = document.documentElement;

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    };

    enterFullscreen();
  }, []);

  // ================= EXIT FULLSCREEN DETECT =================
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        submitTest(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // ================= TIMER =================
  useEffect(() => {
    if (timeLeft <= 0) {
      submitTest(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ================= SELECT OPTION =================
  const selectOption = (qid, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));
  };

  // ================= SUBMIT =================
  const submitTest = async (isAuto = false) => {
    if (submitting || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;

    if (!isAuto && Object.keys(answers).length === 0) {
      alert("Please answer at least one question");
      hasSubmittedRef.current = false;
      return;
    }

    if (!isAuto && timeLeft > 0 && !window.confirm("Are you sure you want to submit?")) {
      hasSubmittedRef.current = false;
      return;
    }

    try {
      setSubmitting(true);

      const formattedAnswers = Object.keys(answers).map((qid) => ({
        questionId: Number(qid),
        selectedOption: answers[qid],
      }));

      const payload = {
        assessmentId: assessment.id,
        answers: formattedAnswers,
      };

      const response = await fetch(
        `${BASE_URL}/springApi/assessment/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        alert(errorText);
        return;
      }

      await response.json();

      if (!isAuto) {
        alert("Test submitted successfully");
      } else {
        alert("Test auto-submitted due to suspicious activity");
      }

      navigate("/student-dashboard");

    } catch (err) {
      console.error(err);
      alert("Error submitting test");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= 🚨 ANTI-CHEAT =================
  useEffect(() => {
    // TAB SWITCH
    const handleVisibilityChange = () => {
      if (document.hidden) {
        submitTest(true);
      }
    };

    // BACK BUTTON FIX
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      submitTest(true);
      window.history.pushState(null, "", window.location.href);
    };

    // REFRESH / CLOSE
    const handleBeforeUnload = (e) => {
      submitTest(true);
      e.preventDefault();
      e.returnValue = "";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [answers, timeLeft]);

  // ================= UI =================
  return (
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">
        <h2>{assessment.title}</h2>
        <div className="timer">⏱ {formatTime(timeLeft)}</div>
      </div>

      {/* BODY */}
      <div className="exam-body">

        {/* QUESTION */}
        <div className="question-panel">
          <h3>
            Q{currentIndex + 1}. {current.questionText}
          </h3>

          <div className="options">
            {current.options.map((opt, i) => (
              <div
                key={i}
                className={`option ${
                  answers[current.id] === opt ? "selected" : ""
                }`}
                onClick={() => selectOption(current.id, opt)}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        {/* PALETTE */}
        <div className="palette">
          <h4>Questions</h4>

          <div className="palette-grid">
            {questions.map((q, i) => (
              <div
                key={i}
                className={`palette-btn ${
                  answers[q.question?.id] ? "answered" : ""
                } ${i === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(i)}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <button
            className="submit-btn"
            onClick={() => submitTest(false)}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="exam-footer">
        <button
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          disabled={currentIndex === 0}
        >
          Previous
        </button>

        <button
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          disabled={currentIndex === questions.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExamScreen;