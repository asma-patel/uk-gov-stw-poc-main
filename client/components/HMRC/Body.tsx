import React, { useContext } from 'react';
import { IndexContext } from '../../pages';

export default function Body() {
    const index = useContext(IndexContext);

    return (
        <div className="govuk-width-container">
            <div className="govuk-breadcrumbs">
                <ol className="govuk-breadcrumbs__list">
                    <li className="govuk-breadcrumbs__list-item">
                        <a className="govuk-breadcrumbs__link" href="#">Home</a>
                    </li>
                    <li className="govuk-breadcrumbs__list-item">
                        <a className="govuk-breadcrumbs__link" href="#">Section</a>
                    </li>
                    <li className="govuk-breadcrumbs__list-item" aria-current="page">Subsection</li>
                </ol>
            </div>

            <main className="govuk-main-wrapper " id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-l">CLEO</h1>

                        <p className="govuk-body">Use this service to:</p>

                        <ul className="govuk-list govuk-list--bullet">
                            <li>Identify a commodity code</li>
                            <li>Licences to declare</li>
                            <li>Discover Custom Procedure to declare</li>
                        </ul>

                        <p className="govuk-body">Doing all the process will take around 5 minutes</p>

                        <a href="#" role="button" draggable="false" 
                        className="govuk-button govuk-!-margin-top-2 govuk-!-margin-bottom-8 govuk-button--start" 
                        data-module="govuk-button"
                        onClick={() => index.setShowCleo(true)}>
                            Start now
                            <svg className="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
                                <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
                            </svg></a>

                        <h2 className="govuk-heading-m">Before you start</h2>

                        <p className="govuk-body">You can also <a className="govuk-link" href="#">register by post</a>.</p>

                        <p className="govuk-body">The online service is also available in <a className="govuk-link" href="#">Welsh (Cymraeg)</a>.</p>

                        <p className="govuk-body">You cannot register for this service if you’re in the UK illegally.</p>
                    </div>

                    <div className="govuk-grid-column-one-third">
                        <aside className="app-related-items" role="complementary">
                            <h2 className="govuk-heading-m" id="subsection-title">
                                Subsection
                            </h2>
                            <nav role="navigation" aria-labelledby="subsection-title">
                                <ul className="govuk-list govuk-!-font-size-16">
                                    <li>
                                        <a className="govuk-link" href="#">
                                            Related link
                                        </a>
                                    </li>
                                    <li>
                                        <a className="govuk-link" href="#">
                                            Related link
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="govuk-link govuk-!-font-weight-bold">
                                            More <span className="govuk-visually-hidden">in Subsection</span>
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </aside>

                    </div>
                </div>
            </main>
        </div>
    );
}
