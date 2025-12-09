Employee Section
1. Registration

An HR representative generates a registration token along with a link to the registration page and sends it to the newly recruited employee’s email address. This is the only way for new employees to access the registration page.

Users must provide a password, unique username, and unique email address (it does not necessarily need to be real).

2. Login

a. Employees can log in with their username/email and password and then be redirected to the Personal Information page.
b. If they are not logged in, redirect them to the Login page.

3. Onboarding

a. A user must set up the username and password after registering their account using the registration token.
b. After setting up the username and password, the user will be redirected to the onboarding page.
c. The onboarding application form contains the following input fields (bold fields are required, the rest are optional):

i. First Name, Last Name, Middle Name, Preferred Name
ii. Avatar (should have a default picture if the user does not upload one)
iii. Current Address
iv. Cell Phone, Work Phone
v. Email (pre-filled with the email used to get the registration token; not editable)
vi. SSN, Date of Birth, Gender (dropdown: Male, Female, Other, I Prefer Not to Say)
vii. “Are you a citizen or permanent resident of the U.S.?”
 1. If yes, choose either “Green Card” or “Citizen”
 2. If no, choose a work authorization type (H1-B, L2, F1(CPT/OPT), H4, Other)
  a. If Other, show an input box for specifying the work authorization, start date, and expiration date.
  b. Otherwise, show input boxes for start date and end date.
  c. In both situations, the user must upload a copy of their work authorization (EAD card, H1B document, etc.)
viii. “Do you have a driver’s license?”
 1. If yes, provide driver’s license number, expiration date, and upload a copy.
ix. Reference (only one person, with fields): First Name, Last Name, Middle Name, Phone, Address, Email, Relationship
x. Emergency Contact (at least one): First Name, Last Name, Middle Name, Phone, Email, Relationship

d. After completing the form, the documentation page should load with all documents (all documents in the DigitalDocument table).
 i. Required documents must be validated before submission.
 ii. Each document must have a download link.
 iii. When clicked, a pop-up preview (<object>) should appear.
 iv. Users must be able to upload completed and signed documents.

e. After all required documents are uploaded, users can submit the onboarding application.
 i. The user should see “Please wait for HR to review your application.”
 ii. Users can go to the home page only if HR approves the application.
 iii. If rejected, an email must be sent to the user. The user should be able to log in and see what is wrong or which document is missing.

4. Home Page

Once the onboarding application has been approved, the user should be able to see the home page after they log in.

The Navigation Bar should allow navigation to:
a. Personal Information
b. Visa Status Management (only if the user is NOT a citizen or green card holder)
 – When hovering over it, show a link to OPT STEM Management
c. Housing
d. House Detail
e. Report Facility Issue

The body of the home page should display a welcome message (e.g., “Hello Zack, Welcome to BeaconFire”).

5. Navigation Bar

The user should be able to use the navigation bar to go to all pages.

6. Personal Information
6(a) Layout and Content Description (Full Raw Text)

User should be able to view their own personal information with the following design:

The layout (based on the screenshot on page 6 of the document) includes multiple information cards arranged in a structured grid. Each card displays one category such as Position, Status, Regular Pay, Employment, Corporate Groups, Work Schedule, Time & Attendance, Custom Fields, etc.

Although the screenshot visually shows a professional HR portal interface, the required textual content is defined as follows:

6(b) Required Visible Sections

i. Name Section

Name — Legal Name (Full Name)

Preferred Name

Avatar

Date of Birth, Age, Gender

SSN (Only show last four digits)

ii. Address Section

Primary Address
 a. Address Line 1, Address Line 2, City, State, Zip

Secondary Address
 a. Address Line 1, Address Line 2, City, State, Zip

iii. Contact Info Section

Personal Email, Work Email

Cell Phone, Work Phone

iv. Employment Section

Work Authorization

Work Authorization Start Date

Work Authorization End Date

Employment Start Date

Employment End Date

Title

Emergency Contact (List View): Full Name, Phone, Address

6(c) Edit Functionality

Each section should have an Edit button.
• When clicked, it should be replaced by Save and Cancel buttons.
• If the user clicks Cancel, an alert should appear: “Are you sure to discard all your changes?”

6(d) Document Section (List View)

i. User should be able to view and download all uploaded documents.
ii. Each document should be shown as an icon + name.
iii. When clicked, show a pop-up preview (<object>).
iv. All documents are ordered by createdDate descending.

7. Visa Status Management

a. User should be able to manage their work authorization on this page. (We only take care of the OPT application process now.)

b. International students have to use OPT/OPT STEM to work in the U.S. During the onboarding process, they must provide the EAD card. The OPT status changes are listed below:

i. (DOWNLOAD) I-983 (Needs to be filled for OPT STEM)
ii. (UPLOAD) I-20 (After submitting the I-983 to the school, the student will receive a new I-20)
iii. (UPLOAD) OPT STEM Receipt (Applied for OPT STEM, but have not yet received the OPT STEM EAD)
iv. (UPLOAD) OPT STEM EAD (Received the OPT STEM EAD), and wait for HR’s response

For all UPLOAD actions, a confirmation email with information on the next step will be sent to the user’s email.

c. A list of documents the user has uploaded:
i. User should be able to view and download all documents they have uploaded.
ii. The document should be displayed as icon + name.
iii. When user clicks on it, show a pop-up with preview (<object>).
iv. All documents should be ordered by createdDate descending (most recent on the top).

8. Housing

a. The employee will be assigned to a house when their registration token has been generated. Employees can only view the details about the house, but cannot change the house assigned to them.

b. House Detail Page
i. Employees should be able to view the following house details:

Address

List of employees who live in the house with the following details:
 a. Name (Preferred Name; if it is empty, then First Name)
 b. Phone

c. Facility Reporting Page
i. Employees should be able to report a facility issue in the house and see all comments by employees or HR.

A Facility Report has the following details:
 a. Title
 b. Description

A list of existing reports with the following details:
 a. Title
 b. Description
 c. Created By (Who reported this issue)
 d. Report Date
 e. Status (Open, In Progress, Closed)
  i. When a report is created, Status = Open

A list of comments with the following details:
 i. Description
 ii. Created By
 iii. Comment Date (Show last modification date if present; otherwise show created date)

For each report, employees can add comments or update comments they created.

HR Section
1. Login

a. Both employee and HR should have exactly the same login portal. The system should be able to check whether the login user is an HR or an employee.
b. At least one HR account should be hardcoded.
c. An HR is also an employee; the difference is that HR has one more role called “HR”.

2. Home Page (HR)

a. After HR login, they should be redirected to the home page with the following details:

i. Navigation Bar (should be displayed on all HR pages)

Employee Profile

Visa Status Management

Hire

House Management

ii. Application Tracking Table (should be included on the Home Page)

The table works as a reminder: if any action needs to be taken to update an employee’s visa status or onboarding process, there should be one item in the table.
 a. Example: If an employee applied for STEM OPT and has already uploaded the new EAD card, a reminder should appear to approve or reject this application.

The application tracking table should contain:
 a. Name (Legal Full Name)
 b. Type of Application
 c. Status
 d. Last Modification Date

3. Employee Profile (HR)

a. HR should be able to view all employee profiles.
b. The profile page for HR is the same as the Employee personal information page, with the following additional features:

Summary and Search Bar

i. HR should be able to view the summary of an employee with:

Name (Legal Full Name)

SSN

Starting Date

Visa Status

ii. The total number of employees should be displayed.
Example: if there are 100 employees and the current profile is the 10th record, display as “<10/100>”.

The ordering should use user_id.

iii. HR should be able to search employees by:

Name (First Name OR Last Name OR Preferred Name)

The design must handle:
– One record found
– Multiple records found
– No record found

4. Visa Status Management (HR)

a. This page works similarly to the Application Tracking Table on the Home Page, but provides more details and allows actions.

b. When HR visits this page, they should see:

i. Name (Full Legal Name)
ii. Work Authorization
iii. Expiration Date
iv. Days Left
v. Active STEM OPT Application and Actions (Approve, Reject, NONE)
 1. HR may reject an application before the final stage (with optional comment).
 2. If a new EAD card is uploaded, HR may approve or reject the application (with optional comment).

vi. Document Received:

HR should be able to access all past documents submitted by the employee.

5. Hire
a. Registration Token Generation

i. HR enters the new hire’s email and clicks “Generate Token and Send Email”.
ii. The default valid duration should be set through the property file, with a default of 3 hours.

b. Application Review

i. HR should review employees’ onboarding applications.

Form Application
 a. HR should be able to view the same form used during onboarding with:
  i. All fields not editable
  ii. All fields populated with user-entered data
  iii. HR able to add comments for the entire application

Supporting Documentation
 a. HR should be able to view each uploaded document and add comments for each document without downloading it.
 b. UI design is flexible.

ii. Each employee can only have one ongoing (non-Completed) application.

iii. Application statuses: Open, Rejected, Completed, plus any other statuses required by your design.

iv. HR may Approve or Reject an application.

If approved:
 – Status becomes Completed
 – Employee may begin another application (such as STEM OPT application)

If rejected:
 – HR must provide comments explaining what is wrong
 – Employee must correct errors or upload missing documents

In both cases, the employee should receive an email notification.

v. HR should be able to view all ongoing onboarding applications. Clicking one should show its details (design is flexible).

6. House Management

a. HR should be able to view, add, and delete house properties belonging to the company.

b. View
i. HR should be able to view all houses with the following details:

Address

Number of employees in the house

Landlord Information:
 a. Legal Full Name
 b. Phone
 c. Email

c. House Detail View
i. Basic House Information:

Address

Landlord Name, Phone, Email

Number of people living there

ii. Facility Information:

Number of Beds

Number of Mattresses

Number of Tables

Number of Chairs

iii. Facility Report (List View)

Display all facility reports with Title + Date + Status format.

Only 3–5 reports per page.

Reports sorted by created date.

Clicking a report shows details:
 a. Title
 b. Description
 c. Created By
 d. Report Date
 e. Status (Open, In Progress, Closed)
  i. Include timestamp of when created
 f. If applicable, comments:
  i. Description
  ii. Created By
  iii. Comment Date (created date or last modification date)

iv. HR may add or update comments they created.

d. Employee Information (List)
i. Name (Preferred Name if present, else First Name)
ii. Phone
iii. Email
iv. Clicking an employee redirects to their Employee Profile page.