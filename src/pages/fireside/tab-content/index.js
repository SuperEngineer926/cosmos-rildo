import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import PageBGImg from '../../../components/shared/page-bg-img';
import backgroundImage from '../../../../public/images/pages-background/fireside.png';
import { useWindowDimensions } from '../../../utils/hooks';

const TabContent = ({ content: { header, content = [] } }) => {
  const { windowWidth } = useWindowDimensions()
  return (
    <>
      <div className="fireside--tabs-content page-layout">
        {header}
        <div className="fireside--tabs-content-summary">
          {
            content.map(({ label, summary }, index) => (
              <Fragment key={index}>
                {label}
                {summary}
              </Fragment>
            ))
          }
        </div>
      </div>
      <PageBGImg
        alt="Fireside page background image"
        className="fireside-tab--background"
        src={backgroundImage}
        styles={{
          backgroundSize: '100% auto',
          height: windowWidth < 912 ? '90vh' : '100vh'
        }}
      />
    </>
  )
};

TabContent.propTypes = {
  content: PropTypes.shape({
    id: PropTypes.number,
    header: PropTypes.node,
    content: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.node,
        summary: PropTypes.node,
      })
    )
  }).isRequired,
};

export default TabContent;
