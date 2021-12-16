/*eslint-disable*/

// React imports
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tippy';


// Custom components imports
import SearchBox from '../alert-graph-view/search-box';
import InfraStats from '../top-stats-panel-view/infra-stats';
import DROPDOWN_IMAGE from '../../../../images/dropdown.svg';

import {
  selectAlertHistoryBound, selectRefreshInterval, setSearchQuery,
  toggleFiltersView, noIntegrationComponentChange
} from '../../../actions/app-actions';
import { REFRESH_INTERVALS_OPTIONS, TIME_BOUNDARY_OPTIONS } from '../../../constants/dashboard-refresh-config';
import { SingleSelectDropdown } from '../dropdown/single-select-dropdown';

class HeaderView extends React.Component {
  constructor() {
    super();
    this.state = {};

    this.removeFilter = this.removeFilter.bind(this);
    this.renderIntegration = this.renderIntegration.bind(this);
    this.setRefreshInterval = this.setRefreshInterval.bind(this);
    this.setHistoryBound = this.setHistoryBound.bind(this);
    this.goBackToIntegrations = this.goBackToIntegrations.bind(this);
  }

  setHistoryBound(dayObj) {
    const { dispatch } = this.props;
    dispatch(selectAlertHistoryBound(dayObj));
  }

  setRefreshInterval(intervalObj) {
    const { dispatch } = this.props;
    dispatch(selectRefreshInterval(intervalObj));
  }

  goBackToIntegrations() {
    const { dispatch } = this.props;
    dispatch(noIntegrationComponentChange());
  }

  renderIntegration() {
    if (window.location.hash === '#/notification') {
      return (
        <div className="dashbord-link" onClick={this.goBackToIntegrations} style={{cursor: 'pointer'}} aria-hidden="true">
          {this.props.changeIntegration ? (<span className="dashboard-breadcrumb" style={{marginRight: '2px', color: '#007BFF'}}> Integrations</span>) : (<span>Integrations</span>)}
          {this.props.changeIntegration && <img src={DROPDOWN_IMAGE} alt="breadcrumb" style={{marginRight: '2px'}} />}
          {this.props.integrationName}
        </div>
      );
    }
    return (
      <div className="dashbord-link">
        {this.props.breadcrumb && this.props.breadcrumb.map((el) => (el.link ? (
          <div style={{display: 'inline'}} key={`${el.id}-${el.name}`}>
            <span className="dashboard-breadcrumb" style={{marginRight: '2px'}}>
              <Link key={el.id} to={el.link} replace>
                {el.name}
                {' '}
              </Link>
            </span>
            <img src={DROPDOWN_IMAGE} alt="breadcrumb" style={{marginRight: '2px'}} />
          </div>
        ) : (
          <span key={`${el.id}-${el.name}`}>
            {' '}
            {el.name}
            {' '}
          </span>
        )))}
      </div>
    );
  }

  componentDidMount() {
    if (!this.props.historyBound) {
      this.props.dispatch(selectAlertHistoryBound(TIME_BOUNDARY_OPTIONS[7]));
    }
    if (!this.props.refreshInterval) {
      this.props.dispatch(selectRefreshInterval(REFRESH_INTERVALS_OPTIONS[2]));
    }
    if (this.props.searchQuery.length > 0) {

    }
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  populateLuceneFilters() {
    const filtersList = this.props.searchQuery.map((filter, index) => (
      <Tooltip title={filter} position="bottom" trigger="mouseenter" key={index}>
        <div className="filter">
          <div className="filter-name truncate">{filter}</div>
          <div
            className="fa fa-times filter-remove-btn"
            onClick={() => this.removeFilter(index)}
            aria-hidden="true"
            style={{paddingLeft: '5px'}} />
        </div>
      </Tooltip>
    ));
    return filtersList;
  }

  removeFilter(filterIndex) {
    const queryCollection = JSON.parse(JSON.stringify(this.props.searchQuery));
    if (filterIndex == 0) {
      const appliedFilter = queryCollection[filterIndex].slice(1, -1);
      this.child.clearSearchBox(appliedFilter);
    }
    queryCollection.splice(filterIndex, 1);
    this.props.dispatch(setSearchQuery({searchQuery: queryCollection}));
    if (queryCollection.length === 0) {
      this.props.dispatch(toggleFiltersView());
    }
  }

  render() {
    return (
      <div className={`header-view ${this.props.isSideNavCollapsed ? 'collapse-fixed-panel' : 'expand-fixed-panel'}`}>
        <div className="infra-summary">
          {this.renderIntegration()}
          <SearchBox onRef={ref => (this.child = ref)} />
          <SingleSelectDropdown
            prefixText="from "
            onChange={this.setHistoryBound}
            options={TIME_BOUNDARY_OPTIONS}
            defaultValue={this.props.historyBound}
            width={150}
          />
          <SingleSelectDropdown
            prefixText="refresh "
            onChange={this.setRefreshInterval}
            options={REFRESH_INTERVALS_OPTIONS}
            defaultValue={this.props.refreshInterval}
            width={150}
          />
          <InfraStats />
        </div>
        {this.props.isFiltersViewVisible && <div className="lucene-filters-wrapper">{this.populateLuceneFilters()}</div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    historyBound: state.get('alertPanelHistoryBound'),
    refreshInterval: state.get('refreshInterval'),
    isSideNavCollapsed: state.get('isSideNavCollapsed'),
    searchQuery: state.get('globalSearchQuery'),
    isFiltersViewVisible: state.get('isFiltersViewVisible'),
    breadcrumb: state.get('breadcrumb'),
    integrationName: state.get('integrationName'),
    changeIntegration: state.get('changeIntegration'),
  };
}

export default connect(
  mapStateToProps
)(HeaderView);
