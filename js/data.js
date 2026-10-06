/* =========================================================================
   Awaaz — FICTIONAL DEMO DATA
   Every record below is invented to exercise the interface. None describes a
   real event. Sources point to example.org and use fictional outlet names.
   Timestamps are generated relative to the moment the page loads so that
   freshness labels can be tested; they do NOT represent real checks.
   ========================================================================= */
(function () {
  const H = 3600 * 1000, D = 24 * H;
  const now = Date.now();
  const t = (ms) => new Date(now + ms).toISOString();
  // date-only (local midnight + hour)
  const day = (offsetDays, hour = 10) => {
    const d = new Date(now + offsetDays * D);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  window.AWAAZ_STATUS = {
    announced: { label: 'Announced', letter: 'A', cls: 'mk-announced', desc: 'A source says this gathering is planned for a future date.' },
    ongoing:   { label: 'Reported ongoing', letter: 'O', cls: 'mk-ongoing', desc: 'A source published while the event was underway reported it as continuing. This is not real-time confirmation.' },
    ended:     { label: 'Ended', letter: 'E', cls: 'mk-ended', desc: 'A source reports the event has concluded or was called off.' },
    unknown:   { label: 'Unknown', letter: '?', cls: 'mk-unknown', desc: 'Sources do not establish whether this is planned, continuing or over.' }
  };
  window.AWAAZ_EVIDENCE = {
    news:       { label: 'News report', icon: 'fa-regular fa-newspaper', cls: '' },
    organizer:  { label: 'Organizer announcement', icon: 'fa-solid fa-bullhorn', cls: '' },
    submission: { label: 'Unreviewed submission', icon: 'fa-regular fa-circle-question', cls: 'tag-warn' }
  };

  const src = (o) => Object.assign({ url: 'https://example.org/awaaz-demo', fictional: true }, o);

  window.AWAAZ_EVENTS = [
    {
      id: 'demo-001',
      title: 'Commuters call for safer suburban rail footbridges',
      cause: 'Public transport',
      state: 'Maharashtra', city: 'Mumbai',
      publicVenue: 'Azad Maidan (public protest ground)',
      locationPrecision: 'venue',
      coordinates: [18.9388, 72.8327],
      eventStart: day(2, 11), eventEnd: day(2, 15),
      status: 'announced', evidence: 'organizer',
      summary: 'A commuter association has announced a sit-in asking the railway authority to publish an audit timeline for ageing footbridges. The announcement describes the gathering as peaceful and permitted.',
      demands: ['Publish footbridge safety audit schedule', 'Add peak-hour crowd marshals at three named stations', 'Create a public grievance tracker'],
      timeline: [
        { at: day(-6), text: 'Association posts open letter (fictional)' },
        { at: day(-1), text: 'Sit-in date and venue announced (fictional)' }
      ],
      sources: [
        src({ outlet: 'Commuter Forum Bulletin (fictional)', title: 'Sit-in announced at Azad Maidan', type: 'organizer', publishedAt: t(-20 * H) }),
        src({ outlet: 'Demo Daily (fictional)', title: 'Rail users plan peaceful sit-in over footbridges', type: 'news', publishedAt: t(-14 * H) })
      ],
      supportingExcerpts: {
        location: { text: '“…the sit-in will be held at Azad Maidan, the designated protest ground…”', sourceIndex: 0 },
        date: { text: '“…on Saturday from 11 am to 3 pm…”', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-14 * H), lastFetchedAt: t(-4 * 60 * 1000), reviewedAt: t(-3 * H)
    },
    {
      id: 'demo-002',
      title: 'Farmers seek revised procurement price for onion crop',
      cause: 'Agriculture',
      state: 'Maharashtra', city: 'Nashik',
      publicVenue: null, locationPrecision: 'city',
      coordinates: [19.9975, 73.7898],
      eventStart: day(-1, 9), eventEnd: null,
      status: 'ongoing', evidence: 'news',
      summary: 'Reports describe a dharna by onion growers near the district market seeking a revised minimum procurement price. Reports name the city but not a specific public venue, so the map shows a city-level marker only.',
      demands: ['Revise procurement price for the current season', 'Faster payment to growers'],
      timeline: [
        { at: day(-1, 9), text: 'Dharna reported to begin (fictional)' },
        { at: day(0, 8), text: 'Second-day report says it continued (fictional)' }
      ],
      sources: [
        src({ outlet: 'Krishi Samachar Demo (fictional)', title: 'Onion growers begin dharna', type: 'news', publishedAt: t(-30 * H) }),
        src({ outlet: 'Demo Daily (fictional)', title: 'Growers’ dharna enters second day', type: 'news', publishedAt: t(-6 * H) })
      ],
      supportingExcerpts: {
        location: { text: '“…growers gathered in Nashik on Tuesday…”', sourceIndex: 0 },
        date: { text: '“…the dharna entered its second day on Wednesday…”', sourceIndex: 1 }
      },
      conflicts: [],
      sourcePublishedAt: t(-6 * H), lastFetchedAt: t(-2 * 60 * 1000), reviewedAt: t(-5 * H)
    },
    {
      id: 'demo-003',
      title: 'Students march for transparent fee-revision process',
      cause: 'Education',
      state: 'Delhi', city: 'New Delhi',
      publicVenue: 'Jantar Mantar',
      locationPrecision: 'venue',
      coordinates: [28.6271, 77.2166],
      eventStart: day(-3, 12), eventEnd: day(-3, 17),
      status: 'ended', evidence: 'news',
      summary: 'Student groups held a march asking that proposed fee revisions be discussed with student representatives before adoption. A follow-up report says the march concluded the same evening.',
      demands: ['Publish fee-revision committee minutes', 'Include elected student representatives'],
      timeline: [
        { at: day(-5), text: 'March announced (fictional)' },
        { at: day(-3, 12), text: 'March held (fictional)' },
        { at: day(-3, 18), text: 'Reported concluded (fictional)' }
      ],
      sources: [
        src({ outlet: 'Capital Campus News (fictional)', title: 'Students gather at Jantar Mantar over fees', type: 'news', publishedAt: t(-3 * D + 2 * H) }),
        src({ outlet: 'Demo Daily (fictional)', title: 'Fee march ends peacefully', type: 'news', publishedAt: t(-3 * D + 8 * H) })
      ],
      supportingExcerpts: {
        location: { text: '“…marched to Jantar Mantar…”', sourceIndex: 0 },
        date: { text: '“…the march ended by 5 pm on Friday…”', sourceIndex: 1 }
      },
      conflicts: [],
      sourcePublishedAt: t(-3 * D + 8 * H), lastFetchedAt: t(-11 * 60 * 1000), reviewedAt: t(-2 * D)
    },
    {
      id: 'demo-004',
      title: 'Residents ask for lake restoration plan',
      cause: 'Environment',
      state: 'Karnataka', city: 'Bengaluru',
      publicVenue: 'Freedom Park',
      locationPrecision: 'venue',
      coordinates: [12.9779, 77.5810],
      eventStart: day(5, 10), eventEnd: day(5, 13),
      status: 'announced', evidence: 'news',
      summary: 'A residents’ collective plans a gathering asking the city to publish a restoration plan for a polluted lake. Two reports give different dates — this conflict is unresolved.',
      demands: ['Publish lake restoration plan', 'Stop untreated inflow', 'Hold a public consultation'],
      timeline: [{ at: day(-2), text: 'Gathering first reported (fictional)' }],
      sources: [
        src({ outlet: 'Garden City Times Demo (fictional)', title: 'Residents to rally for lake revival', type: 'news', publishedAt: t(-2 * D) }),
        src({ outlet: 'Demo Daily (fictional)', title: 'Lake rally planned next week', type: 'news', publishedAt: t(-1 * D) })
      ],
      supportingExcerpts: {
        location: { text: '“…will gather at Freedom Park…”', sourceIndex: 0 },
        date: { text: '“…scheduled for the coming Thursday…”', sourceIndex: 0 }
      },
      conflicts: [
        { field: 'Event date', claims: ['Garden City Times Demo: “coming Thursday”', 'Demo Daily: “Saturday, next week”'] }
      ],
      sourcePublishedAt: t(-1 * D), lastFetchedAt: t(-7 * 60 * 1000), reviewedAt: t(-20 * H)
    },
    {
      id: 'demo-005',
      title: 'Gig delivery workers seek heat-break rules',
      cause: 'Labour rights',
      state: 'Telangana', city: 'Hyderabad',
      publicVenue: 'Indira Park (Dharna Chowk)',
      locationPrecision: 'venue',
      coordinates: [17.4126, 78.4870],
      eventStart: day(1, 16), eventEnd: day(1, 19),
      status: 'announced', evidence: 'organizer',
      summary: 'A delivery workers’ union announced an evening gathering seeking mandatory rest breaks and water stations during extreme heat.',
      demands: ['Mandatory heat breaks', 'Water and shade points', 'Accident insurance clarity'],
      timeline: [{ at: day(-2), text: 'Union announcement (fictional)' }],
      sources: [src({ outlet: 'Riders Union Notice (fictional)', title: 'Evening gathering at Dharna Chowk', type: 'organizer', publishedAt: t(-2 * D) })],
      supportingExcerpts: {
        location: { text: '“…assemble at Dharna Chowk, Indira Park…”', sourceIndex: 0 },
        date: { text: '“…tomorrow, 4 pm to 7 pm…”', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-2 * D), lastFetchedAt: t(-38 * 60 * 1000), reviewedAt: t(-1 * D)
    },
    {
      id: 'demo-006',
      title: 'Tea garden workers demand wage revision',
      cause: 'Labour rights',
      state: 'Assam', city: 'Dibrugarh',
      publicVenue: null, locationPrecision: 'city',
      coordinates: [27.4728, 94.9120],
      eventStart: day(-9, 9), eventEnd: null,
      status: 'unknown', evidence: 'news',
      summary: 'A single report described a strike call by tea garden workers. No later reporting has been found, so its current status is unknown.',
      demands: ['Daily wage revision'],
      timeline: [{ at: day(-9), text: 'Strike call reported (fictional)' }],
      sources: [src({ outlet: 'Brahmaputra Herald Demo (fictional)', title: 'Garden workers call strike', type: 'news', publishedAt: t(-9 * D) })],
      supportingExcerpts: {
        location: { text: '“…gardens in Dibrugarh district…”', sourceIndex: 0 },
        date: { text: '“…from Monday…”', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-9 * D), lastFetchedAt: t(-26 * H), reviewedAt: t(-8 * D)
    },
    {
      id: 'demo-007',
      title: 'Fishers oppose coastal dredging without consultation',
      cause: 'Environment',
      state: 'Kerala', city: 'Thiruvananthapuram',
      publicVenue: null, locationPrecision: 'city',
      coordinates: [8.5241, 76.9366],
      eventStart: day(-2, 8), eventEnd: null,
      status: 'ongoing', evidence: 'news',
      summary: 'Fishing communities are reported to be holding a relay hunger strike over a dredging project. One report says it was called off; another later report says it continues. Conflict flagged.',
      demands: ['Pause dredging until consultation', 'Publish environmental assessment'],
      timeline: [
        { at: day(-2), text: 'Relay hunger strike reported (fictional)' },
        { at: day(-1), text: 'Conflicting report: called off (fictional)' },
        { at: day(0, 7), text: 'Later report: continuing (fictional)' }
      ],
      sources: [
        src({ outlet: 'Coastal Voice Demo (fictional)', title: 'Relay hunger strike begins', type: 'news', publishedAt: t(-2 * D) }),
        src({ outlet: 'Demo Evening (fictional)', title: 'Hunger strike called off, say officials', type: 'news', publishedAt: t(-1 * D) }),
        src({ outlet: 'Coastal Voice Demo (fictional)', title: 'Fishers say strike continues', type: 'news', publishedAt: t(-9 * H) })
      ],
      supportingExcerpts: {
        location: { text: '“…in Thiruvananthapuram’s coastal belt…”', sourceIndex: 0 },
        date: { text: '“…entered its third day on Sunday…”', sourceIndex: 2 }
      },
      conflicts: [
        { field: 'Status', claims: ['Demo Evening: “called off”', 'Coastal Voice Demo (later): “continues”'] }
      ],
      sourcePublishedAt: t(-9 * H), lastFetchedAt: t(-9 * 60 * 1000), reviewedAt: t(-8 * H)
    },
    {
      id: 'demo-008',
      title: 'Parents call for school bus safety norms',
      cause: 'Public safety',
      state: 'West Bengal', city: 'Kolkata',
      publicVenue: 'Esplanade (Y-Channel)',
      locationPrecision: 'venue',
      coordinates: [22.5646, 88.3510],
      eventStart: day(3, 14), eventEnd: day(3, 17),
      status: 'announced', evidence: 'submission',
      summary: 'Submitted by a user and not yet reviewed. Shown on the demo map to illustrate how unreviewed items are labelled. Directions are disabled until reviewed.',
      demands: ['Enforce school bus speed limits', 'GPS-verified routes for buses (not children)'],
      timeline: [{ at: day(-0.5), text: 'User submission received (fictional)' }],
      sources: [src({ outlet: 'User submission (fictional)', title: 'Link to parent association post', type: 'submission', publishedAt: t(-12 * H) })],
      supportingExcerpts: {
        location: { text: '“…Esplanade Y-Channel…” (submitter’s text, unverified)', sourceIndex: 0 },
        date: { text: '“…this Wednesday at 2 pm…” (submitter’s text, unverified)', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-12 * H), lastFetchedAt: t(-12 * H), reviewedAt: null
    },
    {
      id: 'demo-009',
      title: 'Weavers seek yarn price relief',
      cause: 'Livelihoods',
      state: 'Uttar Pradesh', city: 'Varanasi',
      publicVenue: null, locationPrecision: 'city',
      coordinates: [25.3176, 82.9739],
      eventStart: day(-14, 10), eventEnd: day(-14, 16),
      status: 'ended', evidence: 'news',
      summary: 'Handloom weavers held a one-day demonstration seeking relief on yarn prices. Reported as concluded.',
      demands: ['Yarn price subsidy', 'Cluster-level raw material bank'],
      timeline: [{ at: day(-14), text: 'Demonstration held (fictional)' }],
      sources: [src({ outlet: 'Kashi Patrika Demo (fictional)', title: 'बुनकरों का एक दिवसीय धरना', type: 'news', publishedAt: t(-14 * D + 6 * H) })],
      supportingExcerpts: {
        location: { text: '“…वाराणसी में बुनकरों ने…”', sourceIndex: 0 },
        date: { text: '“…सोमवार को एक दिवसीय धरना…”', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-14 * D + 6 * H), lastFetchedAt: t(-3 * D), reviewedAt: t(-13 * D)
    },
    {
      id: 'demo-010',
      title: 'Citizens ask for clean-air action plan',
      cause: 'Environment',
      state: 'Delhi', city: 'New Delhi',
      publicVenue: null, locationPrecision: 'city',
      coordinates: [28.6139, 77.2090],
      eventStart: day(8, 10), eventEnd: null,
      status: 'announced', evidence: 'organizer',
      summary: 'A citizens’ network has announced a human-chain gathering for clean air. The venue has not been published yet, so only a city-level marker is shown.',
      demands: ['Time-bound clean-air action plan', 'Public air-quality dashboards per ward'],
      timeline: [{ at: day(-1), text: 'Date announced; venue “to be shared” (fictional)' }],
      sources: [src({ outlet: 'Clean Air Network Post (fictional)', title: 'Human chain for clean air — venue soon', type: 'organizer', publishedAt: t(-1 * D) })],
      supportingExcerpts: {
        location: { text: '“…in Delhi; exact venue to be shared closer to the date…”', sourceIndex: 0 },
        date: { text: '“…on the second Sunday of the month…”', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-1 * D), lastFetchedAt: t(-15 * 60 * 1000), reviewedAt: t(-22 * H)
    },
    {
      id: 'demo-011',
      title: 'Nurses seek staffing ratio at district hospitals',
      cause: 'Health',
      state: 'Tamil Nadu', city: 'Chennai',
      publicVenue: 'Valluvar Kottam',
      locationPrecision: 'venue',
      coordinates: [13.0500, 80.2400],
      eventStart: day(0, 10), eventEnd: day(0, 14),
      status: 'ongoing', evidence: 'news',
      summary: 'A morning report said nurses had gathered for a demonstration seeking minimum staffing ratios. That report was published hours ago; whether the gathering is still underway is not confirmed.',
      demands: ['Minimum nurse-to-patient ratio', 'Fill sanctioned vacancies'],
      timeline: [{ at: day(0, 10), text: 'Demonstration reported (fictional)' }],
      sources: [src({ outlet: 'Marina Times Demo (fictional)', title: 'Nurses gather at Valluvar Kottam', type: 'news', publishedAt: t(-5 * H) })],
      supportingExcerpts: {
        location: { text: '“…assembled at Valluvar Kottam…”', sourceIndex: 0 },
        date: { text: '“…on Monday morning…”', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-5 * H), lastFetchedAt: t(-3 * 60 * 1000), reviewedAt: t(-4 * H)
    },
    {
      id: 'demo-012',
      title: 'Street vendors ask for vending-zone certificates',
      cause: 'Livelihoods',
      state: 'Gujarat', city: 'Ahmedabad',
      publicVenue: null, locationPrecision: 'city',
      coordinates: [23.0225, 72.5714],
      eventStart: day(-6, 11), eventEnd: day(-6, 15),
      status: 'ended', evidence: 'news',
      summary: 'Vendors held a rally asking the municipal body to issue pending vending certificates. Reported as ended.',
      demands: ['Issue pending vending certificates', 'Notify vending zones'],
      timeline: [{ at: day(-6), text: 'Rally held (fictional)' }],
      sources: [src({ outlet: 'Sabarmati Daily Demo (fictional)', title: 'Vendors rally for certificates', type: 'news', publishedAt: t(-6 * D + 5 * H) })],
      supportingExcerpts: {
        location: { text: '“…vendors in Ahmedabad held a rally…”', sourceIndex: 0 },
        date: { text: '“…on Tuesday…”', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-6 * D + 5 * H), lastFetchedAt: t(-2 * D), reviewedAt: t(-5 * D)
    },
    {
      id: 'demo-013',
      title: 'Hill residents seek landslide-safe road repairs',
      cause: 'Infrastructure',
      state: 'Uttarakhand', city: 'Dehradun',
      publicVenue: null, locationPrecision: 'city',
      coordinates: [30.3165, 78.0322],
      eventStart: day(4, 10), eventEnd: null,
      status: 'announced', evidence: 'news',
      summary: 'Residents’ groups announced a march to the district office seeking landslide-safe road repairs. Report names the city, not a precise route.',
      demands: ['Geotechnical survey before repairs', 'Publish repair timelines'],
      timeline: [{ at: day(-1), text: 'March announced (fictional)' }],
      sources: [src({ outlet: 'Doon Valley Demo (fictional)', title: 'Residents announce march over roads', type: 'news', publishedAt: t(-1 * D) })],
      supportingExcerpts: {
        location: { text: '“…march in Dehradun…”', sourceIndex: 0 },
        date: { text: '“…on Friday…”', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-1 * D), lastFetchedAt: t(-50 * 60 * 1000), reviewedAt: t(-20 * H)
    },
    {
      id: 'demo-014',
      title: 'Commuters ask for more city bus routes',
      cause: 'Public transport',
      state: 'Maharashtra', city: 'Pune',
      publicVenue: null, locationPrecision: 'city',
      coordinates: [18.5204, 73.8567],
      eventStart: day(-4, 10), eventEnd: day(-4, 12),
      status: 'ended', evidence: 'news',
      summary: 'Commuter groups held a signature campaign and short demonstration seeking more bus routes to new suburbs.',
      demands: ['New routes to fringe suburbs', 'Publish fleet expansion plan'],
      timeline: [{ at: day(-4), text: 'Demonstration held (fictional)' }],
      sources: [src({ outlet: 'Pune Samachar Demo (fictional)', title: 'बस मार्गांसाठी प्रवाशांचे आंदोलन', type: 'news', publishedAt: t(-4 * D + 4 * H) })],
      supportingExcerpts: {
        location: { text: '“…पुण्यात प्रवाशांनी…”', sourceIndex: 0 },
        date: { text: '“…गुरुवारी सकाळी…”', sourceIndex: 0 }
      },
      conflicts: [],
      sourcePublishedAt: t(-4 * D + 4 * H), lastFetchedAt: t(-1 * D), reviewedAt: t(-3 * D)
    }
  ];

  window.AWAAZ_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh',
    'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
    'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir',
    'Ladakh','Lakshadweep','Puducherry'
  ];
})();
