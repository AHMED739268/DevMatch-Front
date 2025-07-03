import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Modal, Button } from 'react-bootstrap';

import ChatMessage from '../components/ChatMessage';
import MessageInput from '../components/MessageInput';
import CommentSection from '../components/CommentSection';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiMessageCircle, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Chatpage.css';
import Navbar from '../components/Navbar.jsx'
import {
  fetchMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  createComment,
  updateComment,
  deleteComment
} from '../lib/axios.jsx';
import { useAuthStore } from '../store/useAuthStore.jsx';

export default function ChatPage() {
  const [allMessages, setAllMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = useAuthStore(state => state.authUser);
  const isCheckingAuth = useAuthStore(state => state.isCheckingAuth);

  useEffect(() => {
    if (currentUser !== undefined) {
      useAuthStore.setState({ isCheckingAuth: false });
    }
  }, [currentUser]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await fetchMessages();
        const msgList = Array.isArray(data) ? data : (Array.isArray(data?.messages) ? data.messages : []);
        const normalized = msgList.map(msg => {
          const user = msg.user || {};
          return {
            ...msg,
            user: {
              ...user,
              id: user._id || user.id
            },
            comments: msg.comments || [],
          };
        });

        setAllMessages(normalized);
        setPagination(prev => ({
          ...prev,
          total: normalized.length
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
        setAllMessages([]);
        setLoading(false);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    setMessages(allMessages.slice(start, end));
  }, [allMessages, pagination.page, pagination.limit]);

  const handleSendMessage = async (newMessage) => {
    try {
      const { data } = await createMessage(newMessage);
      const updatedAll = [{
        ...data,
        user: {
          ...(data.user || {}),
          id: data.user?._id || data.user?.id
        }
      }, ...allMessages];

      setAllMessages(updatedAll);
      const start = (pagination.page - 1) * pagination.limit;
      setMessages(updatedAll.slice(start, start + pagination.limit));
      setPagination(prev => ({ ...prev, total: updatedAll.length }));
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleEditMessage = async (messageId, newText) => {
    try {
      const { data } = await updateMessage(messageId, newText);
      const updatedAll = allMessages.map(msg =>
        msg._id === messageId ? {
          ...data,
          comments: msg.comments || [],
          user: {
            ...(data.user || {}),
            id: data.user?._id || data.user?.id
          }
        } : msg
      );

      setAllMessages(updatedAll);
      const start = (pagination.page - 1) * pagination.limit;
      setMessages(updatedAll.slice(start, start + pagination.limit));

      if (selectedMessage?._id === messageId) {
        setSelectedMessage({
          ...data,
          comments: selectedMessage.comments || [],
          user: {
            ...(data.user || {}),
            id: data.user?._id || e43w4rw3a.user?.id
          }
        });
      }
      toast.success('Message updated successfully');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    setItemToDelete({ id: messageId, type: 'message' });
    setShowDeleteModal(true);
  };

  const handleDeleteComment = async (commentId) => {
    setItemToDelete({ id: commentId, type: 'comment' });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      if (itemToDelete.type === 'message') {
        await deleteMessage(itemToDelete.id);
        const updatedAll = allMessages.filter(msg => msg._id !== itemToDelete.id);
        setAllMessages(updatedAll);
        const start = (pagination.page - 1) * pagination.limit;
        setMessages(updatedAll.slice(start, start + pagination.limit));
        setPagination(prev => ({ ...prev, total: updatedAll.length }));
        if (selectedMessage?._id === itemToDelete.id) {
          setSelectedMessage(null);
          setShowComments(false);
        }
        toast.success('Message deleted successfully');
      } else if (itemToDelete.type === 'comment') {
        await deleteComment(itemToDelete.id);
        const updateMsg = msg =>
          msg._id === selectedMessage._id
            ? {
              ...msg,
              comments: (msg.comments || []).filter(comment => comment._id !== itemToDelete.id)
            }
            : msg;

        const updatedAll = allMessages.map(updateMsg);
        setAllMessages(updatedAll);
        const start = (pagination.page - 1) * pagination.limit;
        setMessages(updatedAll.slice(start, start + pagination.limit));
        setSelectedMessage(updateMsg(selectedMessage));
        toast.success('Comment deleted successfully');
      }
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      toast.error(`Failed to delete ${itemToDelete.type}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleAddComment = async (commentText) => {
    if (!selectedMessage) return;
    try {
      const { data: newComment } = await createComment(selectedMessage._id, commentText);
      const updateMsg = msg =>
        msg._id === selectedMessage._id
          ? { ...msg, comments: [...(msg.comments || []), newComment] }
          : msg;

      const updatedAll = allMessages.map(updateMsg);
      setAllMessages(updatedAll);
      const start = (pagination.page - 1) * pagination.limit;
      setMessages(updatedAll.slice(start, start + pagination.limit));
      setSelectedMessage(updateMsg(selectedMessage));
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      const { data: updatedComment } = await updateComment(commentId, newText);
      const updateMsg = msg =>
        msg._id === selectedMessage._id
          ? {
            ...msg,
            comments: (msg.comments || []).map(comment =>
              comment._id === commentId ? updatedComment : comment
            )
          }
          : msg;

      const updatedAll = allMessages.map(updateMsg);
      setAllMessages(updatedAll);
      const start = (pagination.page - 1) * pagination.limit;
      setMessages(updatedAll.slice(start, start + pagination.limit));
      setSelectedMessage(updateMsg(selectedMessage));
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setShowComments(true);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  if (isCheckingAuth || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Container fluid className="chat-page py-3">
        <Row className="g-3 justify-content-center">
          <Col xs={12} lg={8} xl={showComments ? 6 : 8}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-100 d-flex flex-column"
            >
              <div className="d-flex align-items-center mb-3 p-3 bg-white rounded-3 shadow-sm">
                <FiMessageCircle className="me-2" size={24} color="#6366f1" />
                <h4 className="mb-0 text-gradient-primary">Community Chat</h4>
                <div className="ms-auto badge bg-primary bg-opacity-10 text-primary">
                  {pagination.total} messages
                </div>
              </div>

              <div className="messages-container flex-grow-1 mb-3 bg-white rounded-3 shadow-sm p-3 overflow-auto">
                <AnimatePresence>
                  {messages.map(message => (
                    <ChatMessage
                      key={message._id}
                      message={message}
                      isSelected={selectedMessage?._id === message._id}
                      onSelect={() => handleSelectMessage(message)}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                      currentUserId={currentUser?._id || currentUser?.id}
                    />
                  ))}
                </AnimatePresence>

                {messages.length === 0 && !loading && (
                  <div className="text-center py-5">
                    <div className="display-5 text-muted">No messages yet</div>
                    <p className="text-muted">Be the first to start the conversation!</p>
                  </div>
                )}
              </div>

              <div className="pagination-container mb-3">
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}>
                        &laquo; Previous
                      </button>
                    </li>
                    {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => (
                      <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.page * pagination.limit >= pagination.total ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}>
                        Next &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="message-input-container bg-white rounded-3 shadow-sm p-3">
                <MessageInput onSend={handleSendMessage} />
              </div>
            </motion.div>
          </Col>

          <AnimatePresence>
            {showComments && (
              <Col xs={12} lg={4} xl={4} className="mt-lg-0 mt-3">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="bg-white rounded-3 shadow-sm"
                  style={{ maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <CommentSection
                    comments={selectedMessage?.comments || []}
                    onAddComment={handleAddComment}
                    onClose={() => setShowComments(false)}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    currentUserId={currentUser?._id || currentUser?.id}
                  />
                </motion.div>
              </Col>
            )}
          </AnimatePresence>
        </Row>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center">
            <FiAlertTriangle className="text-danger me-2" size={24} />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="lead">
            Are you sure you want to delete this {itemToDelete?.type}?
          </p>
          <p className="text-muted">
            This action cannot be undone and the {itemToDelete?.type} will be permanently removed.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Deleting...</span>
              </>
            ) : (
              <>
                <FiTrash2 className="me-1" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}