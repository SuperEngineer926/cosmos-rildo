import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const PageBGImg = ({ alt, className, src, styles = undefined }) => {
  return (
    <div className={classNames("page-bg-img", className)}
      style={{
        backgroundImage: `url(${src.src})`,
        maxWidth: "100%",
        maxHeight: "100%",
        height: '100vh',
        ...styles
      }}
    >
    </div>
  )
};

PageBGImg.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
  src: PropTypes.shape({}).isRequired,
  styles: PropTypes.object,
};

PageBGImg.defaultProps = {
  alt: "",
  className: "",
  styles: {}
};

export default PageBGImg;
