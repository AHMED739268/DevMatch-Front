import React, { useState, useEffect } from 'react';
import { getRandomQuestions } from '../utils/examData';
import { useExamStore } from '../store/useExamStore';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiEdit3, FiHelpCircle } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/exam.css';
import Navbar from '../components/Navbar.jsx'

const PASS_MARK = 0.7;

const ProgrammerExam = () => {
  const [questions] = useState(getRandomQuestions(5));
  const [answers, setAnswers] = useState(Array(5).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [serverResult, setServerResult] = useState(null);
  const [shake, setShake] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const setPassed = useExamStore((state) => state.setPassed);
  const user = useAuthStore((state) => state.authUser);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  useEffect(() => {
    if (submitted && !serverResult?.examPassed && !serverResult?.blocked) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [submitted, serverResult]);

  useEffect(() => {
    if (serverResult?.blocked && serverResult.examAttempts >= 3) {
      setTimeout(() => {
        logout();
        setTimeout(() => {
          navigate('/login');
        }, 100);
      }, 2000);
    }
  }, [serverResult, logout, navigate]);

  useEffect(() => {
    if (serverResult?.examPassed) {
      setShowPassModal(true);
      toast.success(`You passed the exam with ${(score * 100).toFixed(0)}%! Redirecting to jobs...`, {
        position: 'top-center',
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'colored',
      });
      setTimeout(() => {
        setShowPassModal(false);
        navigate('/jobs');
      }, 1000);
    }
  }, [serverResult, score, navigate]);

  const handleOptionChange = (qIdx, oIdx) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = oIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    const percent = correct / questions.length;
    setScore(percent);
    setSubmitted(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/exam/submit',
        { score: percent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServerResult(res.data);
      if (res.data.examPassed) {
        setPassed(true);
        setAuthUser({ ...user, examPassed: true });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerResult({ blocked: true, message: err.response.data.message });
      } else {
        setServerResult({ blocked: true, message: 'Server error' });
      }
    }
  };

  const progress = Math.round(
    (answers.filter((a) => a !== null).length / questions.length) * 100
  );

  const cardClass = [
    'max-w-4xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl px-8 py-12 transition-all duration-300',
    'border-0',
    'flex flex-col items-center',
    shake ? 'animate-shake' : '',
  ].join(' ');

  const optionClass = (selected) =>
    `exam-option${selected ? ' selected' : ''}`;

  const modalOverlay = "exam-modal-overlay";
  const modalContent = "exam-modal-content";

  if (serverResult?.blocked) {
    return (
      <div className={modalOverlay}>
        <div className={modalContent}>
          <div className="flex items-center mb-4">
            <FiAlertCircle className="text-4xl text-red-600 mr-2" />
            <h2 className="text-2xl font-bold text-red-600">Account Blocked</h2>
          </div>
          <p>
            {serverResult.message ||
              'Your account has been blocked due to failing the exam 3 times.'}
          </p>
          <p className="mt-2 text-gray-500">Please contact support for further assistance.</p>
        </div>
      </div>
    );
  }

  if (serverResult?.examPassed) {
    return (
      <>
        <ToastContainer />
        {showPassModal && (
          <div className={modalOverlay}>
            <div className={modalContent + ' border-green-600'}>
              <div className="flex items-center mb-4">
                <FiCheckCircle className="text-4xl text-green-600 mr-2" />
                <h2 className="text-2xl font-bold text-green-600">Congratulations!</h2>
              </div>
              <p className="text-lg">You passed the exam with <span className="font-semibold">{(score * 100).toFixed(0)}%</span>.</p>
              <p className="mt-2 text-gray-500">Redirecting to jobs...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  if (submitted && !serverResult?.examPassed && !serverResult?.blocked) {
    return (
      <div className={modalOverlay}>
        <div className={modalContent + ' border-yellow-400'}>
          <div className="flex items-center mb-4">
            <FiAlertCircle className="text-3xl text-yellow-600 mr-2" />
            <h2 className="text-2xl font-bold text-yellow-600">Exam Result</h2>
          </div>
          <p>
            You scored <span className="font-semibold">{(score * 100).toFixed(0)}%</span>. You need at least <span className="font-semibold">70%</span> to pass.
          </p>
          {serverResult && (
            <p className="mt-2 text-yellow-600 font-semibold">
              Attempts left: {3 - (serverResult.examAttempts || 0)}
            </p>
          )}
       <button
        className="exam-submit-btn mt-6 flex items-center justify-center"
        onClick={() => {
          setSubmitted(false);
          setAnswers(Array(5).fill(null));
          setScore(0);
          setServerResult(null);
        }}
      >
        <FiEdit3 className="mr-2" />
        Retry
      </button>

        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex justify-center px-2 py-8">
        <form onSubmit={handleSubmit} className={`exam-container ${cardClass}`}>
          <div className="w-full flex items-center justify-center mb-8">
            <h2 className="text-4xl font-extrabold text-blue-700 text-center tracking-tight">
              Programmer Basic Exam
            </h2>
          </div>

          <div className="w-full mb-10">
            <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-blue-700 text-right font-semibold">
              {progress}% completed
            </div>
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="w-full mb-10 p-6 bg-blue-50 dark:bg-blue-900 rounded-2xl shadow flex flex-col"
            >
              <div className="flex items-center mb-4">
                <div className="w-2 h-8 bg-blue-600 rounded-r-lg mr-3"></div>
                <span className="font-bold text-lg text-blue-700 dark:text-blue-200 flex items-center">
                  <FiHelpCircle className="mr-2" />
                  {qIdx + 1}. {q.question}
                </span>
              </div>
              <div className="exam-question-options">
                {q.options.map((opt, oIdx) => (
                  <label key={oIdx} className={optionClass(answers[qIdx] === oIdx)}>
                    <input
                      type="radio"
                      name={`q${qIdx}`}
                      value={oIdx}
                      checked={answers[qIdx] === oIdx}
                      onChange={() => handleOptionChange(qIdx, oIdx)}
                      required
                      className="hidden"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button type="submit" className="exam-submit-btn">
            Submit
          </button>
        </form>
        <ToastContainer />
      </div>
    </>
  );
};

export default ProgrammerExam;
