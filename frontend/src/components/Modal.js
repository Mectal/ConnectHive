import React from 'react';
import PropTypes from 'prop-types';
import styles from './Modal.module.css';
import '../App.css';

const Modal = ({ show, handleClose, handleConfirm, message }) => {
  if (!show) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <p>{message}</p>
        <div className={styles.modalActions}>
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
};

export default Modal;
