import React, { useState, useEffect } from 'react';
import { getRandomQuestions } from '../utils/examData';
import { useExamStore } from '../store/useExamStore';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiEdit3, 
  FiHelpCircle, 
  FiArrowRight,
  FiLock,
  FiAward,
  FiBarChart2,
  FiClock
} from 'react-icons/fi';

const PASS_MARK = 0.7;

const baseCard = 'max-w-2xl w-full mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 transform hover:shadow-2xl';

const ProgrammerExam = () => {
  const [questions] = useState(getRandomQuestions(5));
  const [answers, setAnswers] = useState(Array(5).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [serverResult, setServerResult] = useState(null);
  const [shake, setShake] = useState(false);
  const setPassed = useExamStore((state) => state.setPassed);
  const user = useAuthStore((state) => state.authUser);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  // Animation for fail
  useEffect(() => {
    if (submitted && !serverResult?.examPassed && !serverResult?.blocked) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(timer);
    }
  }, [submitted, serverResult]);

  // Blocked: logout and redirect
  useEffect(() => {
    if (serverResult?.blocked && serverResult.examAttempts >= 3) {
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    }
  }, [serverResult, logout, navigate]);

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

  // Progress bar
  const progress = Math.round(
    (answers.filter((a) => a !== null).length / questions.length) * 100
  );

  // Card classes
  const cardClass = [
    baseCard,
    'border',
    shake ? 'animate-shake border-red-500' : 'border-blue-100 dark:border-gray-700',
    serverResult?.examPassed ? 'border-green-500' : '',
  ].join(' ');

  // Blocked
  if (serverResult?.blocked) {
    return (
      <div className={cardClass + ' border-red-500'}>
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
          <div className="flex items-center">
            <FiLock className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">Account Blocked</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-start mb-6">
            <FiAlertCircle className="text-2xl text-red-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                {serverResult.message ||
                  'Your account has been blocked due to failing the exam 3 times.'}
              </p>
              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Please contact support for further assistance.
              </p>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-gray-700 p-4 rounded-lg border border-red-100 dark:border-gray-600">
            <div className="flex items-center text-red-600 dark:text-red-400">
              <FiClock className="mr-2" />
              <span>You will be redirected to login page shortly...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Passed
  if (serverResult?.examPassed) {
    return (
      <div className={cardClass + ' border-green-500'}>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-center">
            <FiAward className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">Congratulations!</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-start mb-6">
            <FiCheckCircle className="text-2xl text-green-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                You passed the exam with <span className="font-semibold text-green-600 dark:text-green-400">{(score * 100).toFixed(0)}%</span>.
              </p>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                You can now apply for jobs in our platform.
              </p>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg border border-green-100 dark:border-gray-600">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <FiBarChart2 className="mr-2" />
              <span>Your score is above the {PASS_MARK * 100}% passing mark!</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed (not blocked)
  if (submitted && !serverResult?.examPassed && !serverResult?.blocked) {
    return (
      <div className={cardClass}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center">
            <FiAlertCircle className="text-3xl mr-3" />
            <h2 className="text-2xl font-bold">Exam Result</h2>
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-start mb-6">
            <FiAlertCircle className="text-2xl text-yellow-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                You scored <span className="font-semibold text-blue-600 dark:text-blue-400">{(score * 100).toFixed(0)}%</span>. 
                You need at least <span className="font-semibold text-green-600 dark:text-green-400">70%</span> to pass.
              </p>
              {serverResult && (
                <p className="mt-3 text-yellow-600 dark:text-yellow-400 font-semibold">
                  <FiAlertCircle className="inline mr-2" />
                  Attempts left: {3 - (serverResult.examAttempts || 0)}
                </p>
              )}
            </div>
          </div>
          <button
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-all transform hover:-translate-y-1"
            onClick={() => {
              setSubmitted(false);
              setAnswers(Array(5).fill(null));
              setScore(0);
              setServerResult(null);
            }}
          >
            <FiEdit3 className="mr-2" />
            Retry Exam
            <FiArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    );
  }

  // Main exam form
  return (
    <form onSubmit={handleSubmit} className={cardClass}>
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-center">
          <FiHelpCircle className="text-3xl mr-3" />
          <h2 className="text-2xl font-bold">Programmer Basic Exam</h2>
        </div>
      </div>
      
      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Progress
            </span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {questions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="mb-6 p-5 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 transition-all hover:shadow-md"
          >
            <div className="flex items-start font-semibold mb-4 text-lg text-blue-600 dark:text-blue-300">
              <FiHelpCircle className="mt-1 mr-3 flex-shrink-0" />
              <span>{qIdx + 1}. {q.question}</span>
            </div>
            <div className="space-y-3">
              {q.options.map((opt, oIdx) => (
                <label
                  key={oIdx}
                  className={`flex items-center p-3 rounded-lg cursor-pointer border transition-all
                    ${
                      answers[qIdx] === oIdx
                        ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-600 dark:border-gray-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name={`q${qIdx}`}
                    value={oIdx}
                    checked={answers[qIdx] === oIdx}
                    onChange={() => handleOptionChange(qIdx, oIdx)}
                    required
                    className="form-radio h-5 w-5 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-gray-300 dark:border-gray-500 mr-3"
                  />
                  <span className="text-gray-700 dark:text-gray-200">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={progress < 100}
          className={`w-full py-4 px-6 mt-2 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${progress < 100 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          Submit Exam
        </button>
      </div>
    </form>
  );
};

export default ProgrammerExam;