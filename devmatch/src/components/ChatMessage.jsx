import { useState, useEffect } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaComment, FaRegComment, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';

export default function ChatMessage({ 
  message, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete,
  currentUserId 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerCheckDone, setOwnerCheckDone] = useState(false);

  useEffect(() => {
    if (!message.user || !currentUserId) {
      setIsOwner(false);
      setOwnerCheckDone(true);
      return;
    }
    
    // Use consistent id field (message.user.id)
    const msgUserId = String(message.user.id || '');
    const myUserId = String(currentUserId || '');
    
    setIsOwner(msgUserId === myUserId);
    setOwnerCheckDone(true);
  }, [message, currentUserId]);

  const handleSave = () => {
    if (editedText.trim()) {
      onEdit(message._id, editedText);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="mb-3"
    >
      <Card 
        className={`glass-card ${isSelected ? 'border-primary' : ''}`}
        onClick={() => onSelect(message)}
      >
        <Card.Body>
          <div className="d-flex">
            <img 
              src={message.user?.image || '/default-avatar.png'} 
              alt={message.user?.name || 'User'}
              className="rounded-circle me-3"
              width="40"
              height="40"
            />
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Card.Title className="mb-0 text-primary">
                  {message.user?.name || 'Unknown User'}
                  {/* Owner indicator badge */}
                  {isOwner && <span className="badge bg-success ms-2">Author</span>}
                </Card.Title>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted me-2">
                    {format(new Date(message.createdAt), 'MMM dd, h:mm a')}
                  </small>
                  
                  {/* Loading state for owner check */}
                  {!ownerCheckDone && (
                    <Spinner animation="border" size="sm" />
                  )}
                  
                  {ownerCheckDone && isOwner && !isEditing && (
                    <>
                      <button
                        className="btn btn-link p-0 text-primary fs-5"
                        title="Edit"
                        style={{ minWidth: 32 }}
                        onClick={e => { e.stopPropagation(); setIsEditing(true); }}
                        tabIndex={0}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-link p-0 text-danger fs-5"
                        title="Delete"
                        style={{ minWidth: 32 }}
                        onClick={e => { e.stopPropagation(); onDelete(message._id); }}
                        tabIndex={0}
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {isEditing ? (
                <div className="mb-2">
                  <input
                    type="text"
                    value={editedText}
                    onChange={e => setEditedText(e.target.value)}
                    className="form-control mb-2"
                    onClick={e => e.stopPropagation()}
                    autoFocus
                  />
                  <div className="d-flex gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); handleSave(); }}
                      className="btn btn-primary btn-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setIsEditing(false); setEditedText(message.text); }}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <Card.Text className="text-dark mb-2">{message.text}</Card.Text>
              )}
              
              <div className="d-flex align-items-center">
                {message.comments?.length > 0 ? (
                  <FaComment className="text-primary me-1" />
                ) : (
                  <FaRegComment className="text-muted me-1" />
                )}
                <small className={message.comments?.length > 0 ? 'text-primary' : 'text-muted'}>
                  {message.comments?.length || 0} {message.comments?.length === 1 ? 'comment' : 'comments'}
                </small>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}