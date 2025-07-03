import { useState } from 'react';
import { Card, Button, Form, Dropdown } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiX, FiSend, FiEdit, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';

const COMMENTS_PER_PAGE = 5;

export default function CommentSection({ 
  comments = [], 
  onAddComment, 
  onClose,
  onEditComment,
  onDeleteComment,
  currentUserId
}) {
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [page, setPage] = useState(1);

  // Paginate comments in-memory
  const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE);
  const paginatedComments = comments.slice((page - 1) * COMMENTS_PER_PAGE, page * COMMENTS_PER_PAGE);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  const handleCommentEdit = (commentId, text) => {
    setEditingCommentId(null);
    onEditComment(commentId, text);
  };

  return (
    <Card className="glass-card" style={{ maxHeight: '70vh', minHeight: '350px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white border-0">
        <Card.Title className="mb-0">Replies</Card.Title>
        <Button 
          variant="link" 
          onClick={onClose}
          className="text-white p-0"
        >
          <FiX size={20} />
        </Button>
      </Card.Header>
      <Card.Body className="comments-body" style={{ overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
        {paginatedComments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <p className="text-muted">No comments yet</p>
            <small className="text-muted">Be the first to comment</small>
          </motion.div>
        ) : (
          paginatedComments.map(comment => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-3 p-3 bg-light rounded"
            >
              <div className="d-flex align-items-start">
                <img 
                  src={comment.user?.image || '/default-avatar.png'} 
                  alt={comment.user?.name || 'User'}
                  className="rounded-circle me-3"
                  width="32"
                  height="32"
                />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="text-primary">{comment.user?.name || 'Unknown User'}</strong>
                    <div className="d-flex align-items-center">
                      <small className="text-muted me-2">
                        {format(new Date(comment.createdAt), 'h:mm a')}
                      </small>
                      {String(comment.user?._id || comment.user?.id) === String(currentUserId) && (
                        <Dropdown>
                          <Dropdown.Toggle variant="link" className="p-0">
                            <FiEdit size={16} className="text-primary" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditedCommentText(comment.text);
                            }}>
                              <FiEdit className="me-2" /> Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => onDeleteComment(comment._id)}>
                              <FiTrash2 className="me-2" /> Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      )}
                    </div>
                  </div>
                  {editingCommentId === comment._id ? (
                    <div className="mb-2">
                      <input
                        type="text"
                        value={editedCommentText}
                        onChange={(e) => setEditedCommentText(e.target.value)}
                        className="form-control mb-2"
                        autoFocus
                      />
                      <div className="d-flex gap-2">
                        <button 
                          onClick={() => handleCommentEdit(comment._id, editedCommentText)}
                          className="btn btn-primary btn-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingCommentId(null)}
                          className="btn btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-between">
                      <p className="mb-0 text-dark flex-grow-1">{comment.text}</p>
                      {String(comment.user?._id || comment.user?.id) === String(currentUserId) && (
                        <div className="d-flex gap-2 ms-2">
                          <button
                            className="btn btn-link p-0 text-primary"
                            title="Edit"
                            onClick={() => { setEditingCommentId(comment._id); setEditedCommentText(comment.text); }}
                            tabIndex={0}
                          >
                            <FiEdit />
                          </button>
                          <button
                            className="btn btn-link p-0 text-danger"
                            title="Delete"
                            onClick={() => onDeleteComment(comment._id)}
                            tabIndex={0}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </Card.Body>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center py-2 border-top bg-white">
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
      <Card.Footer className="border-0 bg-white">
        <Form onSubmit={handleSubmit}>
          <Form.Control
            as="textarea"
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="border-0 bg-light mb-2"
            style={{ resize: 'none' }}
          />
          <Button 
            variant="primary" 
            type="submit" 
            className="float-end"
            disabled={!commentText.trim()}
          >
            <FiSend size={16} className="me-1" /> Post Comment
          </Button>
        </Form>
      </Card.Footer>
    </Card>
  );
}