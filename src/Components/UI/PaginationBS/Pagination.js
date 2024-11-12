import React from 'react';
import PropTypes from 'prop-types';
import { Pagination as PaginationBS, PaginationLink, PaginationItem, Row } from 'reactstrap';

import './Pagination.modules.css';

const LEFT_PAGE = 'LEFT';
const RIGHT_PAGE = 'RIGHT';

const range = (from, to, step = 1) => {
    let i = from;
    const range = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
}


const Pagination = (props) => {
    const { totalPages, currentPage, pageNeighbours } = props;

    const fetchPageNumbers = () => {
        const totalNumbers = (pageNeighbours * 2) + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages > totalBlocks) {
            const startPage = Math.max(2, currentPage - pageNeighbours);
            const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);
            let pages = range(startPage, endPage);

            const hasLeftSpill = startPage > 2;
            const hasRightSpill = (totalPages - endPage) > 1;
            const spillOffset = totalNumbers - (pages.length + 1);
            //console.log(pages.length + 1, spillOffset, hasLeftSpill, hasRightSpill);
            switch (true) {
                case (hasLeftSpill && !hasRightSpill): {
                    const extraPages = range(startPage - spillOffset, startPage - 1);
                    pages = [LEFT_PAGE, ...extraPages, ...pages];
                    break;
                }

                case (!hasLeftSpill && hasRightSpill): {
                    const extraPages = range(endPage + 1, endPage + spillOffset);
                    pages = [...pages, ...extraPages, RIGHT_PAGE];
                    break;
                }

                case (hasLeftSpill && hasRightSpill):
                default: {
                    pages = [LEFT_PAGE, ...pages, RIGHT_PAGE];
                    break;
                }
            }

            return [1, ...pages, totalPages];
        }

        return range(1, totalPages);
    }

    const pages = fetchPageNumbers();

    const gotoPage = (page) => {
        const { onPageChanged = f => f } = props;
        onPageChanged(page);
    };

    const onClickHandle = page => evt => {
        evt.preventDefault();
        gotoPage(page);
    }

    const moveLeftHandle = () => {
        gotoPage(Math.max(1, currentPage - (pageNeighbours * 2) - 1));
    };

    const moveRightHandle = () => {
        gotoPage(Math.min(totalPages, currentPage + (pageNeighbours * 2) + 1));
    };

    if (totalPages === 1) {
        return (<></>);
    };

    return (
        <Row className="pagination-row">
            <PaginationBS className='filter-group'>
                {pages.map((page) => {

                    if (page === LEFT_PAGE) return (
                        <PaginationItem key='prev'>
                            <PaginationLink previous onClick={moveLeftHandle} />
                        </PaginationItem>
                    );

                    if (page === RIGHT_PAGE) return (
                        <PaginationItem key='next'>
                            <PaginationLink next onClick={moveRightHandle} />
                        </PaginationItem>
                    );

                    return (
                        <PaginationItem key={page} active={currentPage === page}>
                            <PaginationLink onClick={onClickHandle(page)}>
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    );

                })}
            </PaginationBS>
        </Row>
    )
};

Pagination.propTypes = {
    totalRecords: PropTypes.number.isRequired,
    pageLimit: PropTypes.number,
    pageNeighbours: PropTypes.number,
    onPageChanged: PropTypes.func
};

export default Pagination;