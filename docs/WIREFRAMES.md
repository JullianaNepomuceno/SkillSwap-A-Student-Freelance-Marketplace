# Wireframes

Low-fidelity layouts for the four main screens.

## Screen 1: Browse Gigs (`index.php`)
CSS Grid · JS filter · PHP/MySQL loop

```
+-----------------------------------------------------------------------+
| SKILLSWAP  [Browse] [Post a Gig] [My Dashboard]      [ Hi, Student ]  |
+-----------------------------------------------------------------------+
| Find a gig: [ Search keyword...                 ]  [ Search ]         |
+-----------------------+-----------------------------------------------+
| FILTERS (JS)          | OPEN GIGS (12 results)                        |
| Category:             | +--------------------+ +--------------------+ |
| [x] Graphic Design    | | Logo for Org Fest  | | Python Tutoring    | |
| [ ] Web Development   | | Graphic Design     | | Tutoring           | |
| [ ] Writing           | | P500 | Due Oct 20  | | P300 | Due Oct 18  | |
| [ ] Tutoring          | | 3 applicants       | | 1 applicant        | |
|                       | | [ View & Apply ]   | | [ View & Apply ]   | |
| Budget: P0 --o-- P2k  | +--------------------+ +--------------------+ |
| Status: [ Open v ]    |   ...more gig cards...  [ 1 ] [ 2 ] [ 3 ]     |
+-----------------------+-----------------------------------------------+
```

## Screen 2: Gig Details & Apply (`gig.php?id=1`)
PHP POST · JS validation

```
+-----------------------------------------------------------------------+
| < Back to Browse                                   [ Hi, Student ]    |
+-------------------------------------+---------------------------------+
| Logo for Org Fest                   | Apply to this Gig               |
| Graphic Design | Status: Open       | Name: [ Juan D.          ]      |
| Budget: P500   Due: Oct 20          | Proposal:                       |
| Posted by: Student Council          | [ I can deliver in 3 days ]     |
|                                     | Rate (P): [ 450 ]               |
| Need a logo and banner for our      | [ Submit Application ]          |
| org's foundation week. PNG and      |                                 |
| SVG files preferred.                |                                 |
+-------------------------------------+---------------------------------+
| Applicants (client view)         Rate    Status                       |
|   Maria S.  (portfolio)          P450    Pending [Accept][Reject]     |
|   Carlo R.  (portfolio)          P500    Pending [Accept][Reject]     |
+-----------------------------------------------------------------------+
```

## Screen 3: Post a Gig (`post_gig.php`)
JS validation · live preview

```
+-----------------------------------------------------------------------+
| < Back to Browse                                   [ Hi, Student ]    |
+-------------------------------------+---------------------------------+
| Title:    [ Logo for Org Fest ]     | Live Preview (JS)               |
| Category: [ Graphic Design  v]      | +-------------------------+     |
| Budget:   [ 500 ]  (in pesos)       | | Logo for Org Fest       |     |
| Deadline: [ 2026-10-20 ]            | | Graphic Design          |     |
| Details:  [ Need a logo and... ]    | | P500 | Due Oct 20       |     |
|                                     | | Status: Open            |     |
| [ Post Gig ]                        | +-------------------------+     |
|                                     |                                 |
| ! Budget must be a number > 0       |                                 |
+-------------------------------------+---------------------------------+
```

## Screen 4: My Dashboard (`dashboard.php`)
Chart.js · PHP/MySQL loop

```
+-----------------------------------------------------------------------+
| Posted: 8     In Progress: 3     Completed: 5     Applications: 21    |
+-----------------------------+-----------------------------------------+
| Applications / Week (JS)    | My Gigs                    Status       |
|   8|    *                   | Logo Design                Open         |
|   4|  * * *   *             | Python Tutoring            In Progress  |
|   0+------------            | Poster Layout              Completed    |
|     M T W T F S S           | [ Mark as Completed ]                   |
+-----------------------------+-----------------------------------------+
```
