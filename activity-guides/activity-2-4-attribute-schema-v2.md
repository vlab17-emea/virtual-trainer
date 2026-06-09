---
activity: "2.4"
week: 2
module: "Module 2: Create XDM Schemas, Import Packages, and Apply Data Governance"
title: "Create a Customer Attribute XDM Schema in the Experience Platform UI"
type: literal_exercise
prerequisites:
  - "Activity 2.2: Observe Roles and Assigned Permissions"
  - "Activity 2.3: Import Standard Package into Your Sandbox"
outcome: "A profile schema named <firstname>-Customer Profile Schema, enabled for Real-Time Customer Profile, with 8 standard field groups, a custom identity field group, and identity fields mapped (emailId as primary)"
verification: "In Schemas, your schema shows XDM Individual Profile class, 8+ field groups listed, and identity icons (circle markers) visible on ecid, emailId, emailIdSha256, and mobilenr fields. Profile toggle is enabled."
estimated_time: "45 minutes"
tasks: ["Task 1: Create Attributes-based XDM Schema", "Task 2: Add Field Groups", "Task 3: Add Custom Field Group", "Task 4: Define Identity Mapping"]
---

# Activity 2.4: Create a Customer Attribute XDM Schema

This activity creates the foundation schema for storing customer profile attributes in Adobe Experience Platform. You will build it in four tasks: create the schema, add standard field groups, add a custom identity field group, then define identity mapping.

Work in your assigned learner sandbox only (for example, Learner-02).

---

## Task 1: Create Attributes-based XDM Schema

**Task outcome:** A new schema named `<firstname>-Customer Profile Schema` with class XDM Individual Profile, ready to receive field groups.

### Step 1

**Task:** Navigate to Schemas and open the schema creation dialog.

**Detail:** In the Experience Platform UI, go to the left navigation menu. Under **DATA MANAGEMENT**, click **Schemas**. On the top-right, click **Create schema**. The Create a schema dialog opens.

**Hint 1:** Schemas is under DATA MANAGEMENT, not Data Collection. If you cannot find it, check that you are on the Experience Platform app and not another Adobe product.

**Hint 2:** The Create schema button is in the top-right corner of the Schemas page.

**Expected result:** The Create a schema dialog opens with two options: Manual and ML-Assisted (Beta).

**Common mistake:** Clicking into an existing schema instead of creating a new one.

{{img:activity-2-4-attribute-schema-01}}

---

### Step 2

**Task:** Select Manual mode and choose the Individual Profile class.

**Detail:** Click the **Manual** option and click **Select**. On the Create schema page, click **Individual Profile** to create an attributes-based XDM schema, then click **Next**.

**Hint 1:** Choose Manual, not ML-Assisted. ML-Assisted requires sample CSV data and is not used in this exercise.

**Hint 2:** There are three class options — Individual Profile, Experience Event, and Other. For customer attribute data (names, emails, phone numbers), always choose Individual Profile.

**Expected result:** The Name and review section opens.

**Common mistake:** Selecting Experience Event instead of Individual Profile. Experience Event is for time-series behavioural data — you will use that in Activity 2.5.

{{img:activity-2-4-attribute-schema-02}}

---

### Step 3

**Task:** Name the schema and finish creation.

**Detail:** In the **Schema display name** box, type `<your first name>-Customer Profile Schema` — for example, `John-Customer Profile Schema`. Optionally add a description. Click **Finish**.

**Hint 1:** Use your first name as a prefix so your schema can be distinguished from other learners' schemas in the shared sandbox.

**Hint 2:** The display name must be unique within your organisation. If you get an error, check that no one else has already used the same name.

**Expected result:** The Schema created successfully message appears. The schema editor opens showing XDM Individual Profile listed under Class in the Composition panel.

**Common mistake:** Using a space instead of a hyphen in the name, or forgetting to include your first name prefix.

{{img:activity-2-4-attribute-schema-03}}

---

### Step 4

**Task:** Confirm the schema was created with the correct class.

**Detail:** Observe the schema editor. Under the **Class** section in the Composition panel on the left, **XDM Individual Profile** should be listed. The Structure panel on the right shows the default class fields (_id, _repo, etc.).

**Hint 1:** If you do not see XDM Individual Profile under Class, the wrong class was selected. You will need to delete this schema and start Task 1 again.

**Expected result:** Schema editor open, XDM Individual Profile listed as class, no field groups yet.

**Note:** When ingesting data against this schema, some fields are required. For example, `_id` is a required field with a unique ID representing a specific data ingestion.

{{img:activity-2-4-attribute-schema-04}}

---

## Task 2: Add Field Groups to the XDM Schema

**Task outcome:** Eight standard Adobe field groups added to the schema, providing demographic, contact, consent, loyalty, and segment membership fields.

### Step 5

**Task:** Open the Add field groups dialog.

**Detail:** In the Composition panel on the left, under **Field groups**, click **Add**. The Add field groups page opens. Retain the default selection **Use existing field groups**.

**Hint 1:** The Add button appears next to "Field groups" in the Composition panel on the left side of the schema editor.

**Expected result:** The Add field groups dialog opens showing a list of available standard field groups.

{{img:activity-2-4-attribute-schema-05}}

---

### Step 6

**Task:** Select the eight required standard field groups.

**Detail:** From the NAME column, select all of the following field groups:
- Demographic Details
- Personal Contact Details
- Preference Details
- Consent and Preference Details
- IAB TCF 2.0 Consent Details
- Segment Membership Details
- Loyalty Details
- Work contact details

Then click **Add field groups** on the top-right.

**Hint 1:** You can type part of the name in the search box to find each field group quickly.

**Hint 2:** You can select multiple field groups before clicking Add — you do not need to add them one at a time.

**Expected result:** All eight field groups appear under Field groups in the Composition panel. Their fields are visible in the Structure panel.

**Common mistake:** Missing one or more field groups. Segment Membership Details is required later when you create audiences. Loyalty Details is used in the capstone project.

{{img:activity-2-4-attribute-schema-06}}

---

### Step 7

**Task:** Save the schema.

**Detail:** Click **Save** to save the edits to the schema.

**Hint 1:** If the Save button is greyed out, no changes have been made yet. Check that the field groups were added correctly.

**Expected result:** The schema is saved. The field groups remain visible in the Composition panel.

**Common mistake:** Navigating away without saving. Always save before moving to the next task.

{{img:activity-2-4-attribute-schema-07}}

---

## Task 3: Add a Custom Field Group to the XDM Schema

**Task outcome:** A custom field group named `<firstname> Profile Identification` added to the schema, containing an `identification` object with four string sub-fields: ecid, emailId, emailIdSha256, mobilenr.

### Step 8

**Task:** Create a new custom field group.

**Detail:** Under Field groups in the Composition panel, click **Add**. This time click **Create a new field group**. In the Display name box, type `<your first name> Profile Identification` (for example, `John Profile Identification`). Type the same in the Description box. Click **Add field groups**.

**Hint 1:** Make sure you click "Create a new field group" not "Use existing field groups".

**Hint 2:** Use your first name prefix to avoid conflicts with other learners' field groups in the shared sandbox.

**Expected result:** The new field group appears in the Composition panel under Field groups. It is empty — you will add fields to it next.

{{img:activity-2-4-attribute-schema-08}}

---

### Step 9

**Task:** Select your custom field group and open the add field panel.

**Detail:** In the Composition panel, under Field groups, click your newly added `<firstname> Profile Identification` field group to select it. Then click the **add field icon (+)** next to your schema name in the Structure panel.

**Hint 1:** The + icon only appears next to your schema name when your custom field group is selected in the Composition panel. If you click + while a standard field group is selected, you will get an error.

**Hint 2:** A new field named "Untitled Field | Type" will appear in the Structure panel and the Field properties pane will open on the right.

**Expected result:** The Field properties pane opens on the right ready for you to define a new field.

**Note:** The new field is added under your Experience Platform Tenant ID node. The tenant ID name varies by environment (for example, adlsplatformapac, aepcohort51). Check with your instructor if unsure.

{{img:activity-2-4-attribute-schema-09}}

---

### Step 10

**Task:** Define the identification object field.

**Detail:** In the Field properties pane, fill in:
- **Field name:** `identification` (all lowercase)
- **Display name:** `identification`
- **Type:** `Object`
- **Field Group:** select your `<firstname> Profile Identification` field group from the dropdown

Click **Apply**.

**Hint 1:** The Field Group dropdown only becomes active after you have selected the Type. Select Object first, then choose your field group.

**Hint 2:** Field name must be all lowercase with no spaces or special characters.

**Expected result:** An `identification | Object` node appears in the Structure panel under your tenant ID. The Field properties pane closes.

**Common mistake:** Choosing String instead of Object for the type. Object is required because identification will contain multiple sub-fields.

{{img:activity-2-4-attribute-schema-10}}

---

### Step 11

**Task:** Add four sub-fields to the identification object.

**Detail:** Click the **+ icon** next to `identification | Object` to add a sub-field. Add the following four fields one at a time, clicking **Apply** after each:

| Field name | Display name | Type |
|------------|--------------|------|
| ecid | ecid | String |
| emailId | emailId | String |
| emailIdSha256 | emailIdSha256 | String |
| mobilenr | mobilenr | String |

**Hint 1:** Click the + icon next to `identification | Object` each time — not the + next to the schema name.

**Hint 2:** All field names must be exactly as shown — camelCase, no spaces.

**Hint 3:** For each sub-field, do not select any Field Group — leave it blank or it will default correctly.

**Expected result:** Four String fields (ecid, emailId, emailIdSha256, mobilenr) visible under `identification | Object` in the Structure panel.

**Common mistake:** Adding the fields at the wrong level — they must be inside `identification | Object`, not at the top level of the schema.

{{img:activity-2-4-attribute-schema-11}}

---

## Task 4: Define Identity Mapping

**Task outcome:** Four identity fields defined on the schema — emailId as primary identity, ecid / emailIdSha256 / mobilenr as secondary identities — enabling identity stitching across data sources.

**Background:** In Experience Platform, XDM fields marked as identities are used to stitch together information about individual customers from multiple data sources. A single primary identity must be defined for the schema to be enabled for Real-Time Customer Profile.

### Step 12

**Task:** Mark ecid as a secondary identity with ECID namespace.

**Detail:** In the Structure panel, under `identification | Object`, click **ecid**. In the Field properties pane on the right, scroll down and check **Identity**. Do not check Primary Identity. From the Identity namespace dropdown, select **ECID**. Click **Apply**.

**Hint 1:** Scroll down in the Field properties pane — the Identity checkbox is below the Type field.

**Hint 2:** ECID is the Experience Cloud ID — a device-level identifier used across all Adobe products.

**Expected result:** The ecid field shows an identity icon (filled circle) in the Structure panel indicating it is now an identity field.

{{img:activity-2-4-attribute-schema-12}}

---

### Step 13

**Task:** Mark emailId as the primary identity with Email namespace.

**Detail:** Click **emailId** in the Structure panel. In the Field properties pane, check **Identity** and also check **Primary Identity**. From the Identity namespace dropdown, select **Email**. Click **Apply**.

**Hint 1:** Only one field can be the Primary Identity per schema. Email is typically used as the primary identifier because it persists across devices.

**Expected result:** The emailId field shows a primary identity icon (filled circle with a key symbol) in the Structure panel.

**Common mistake:** Setting more than one field as Primary Identity. Only emailId should be primary.

{{img:activity-2-4-attribute-schema-13}}

---

### Step 14

**Task:** Mark emailIdSha256 as a secondary identity.

**Detail:** Click **emailIdSha256** in the Structure panel. Check **Identity** but do NOT check Primary Identity. From the Identity namespace dropdown, select **EmailIdSha256 (lowercase)**. Click **Apply**.

**Hint 1:** SHA256 is a hashed version of the email address used for privacy-safe matching. It must not be set as primary.

**Expected result:** The emailIdSha256 field shows a secondary identity icon.

**Note:** Do not select the Primary identity checkbox for this field.

{{img:activity-2-4-attribute-schema-14}}

---

### Step 15

**Task:** Mark mobilenr as a secondary identity.

**Detail:** Click **mobilenr** in the Structure panel. Check **Identity** but NOT Primary Identity. From the Identity namespace dropdown, select **Phone**. Click **Apply**.

**Expected result:** The mobilenr field shows a secondary identity icon. All four identity fields now show circle markers in the Structure panel.

{{img:activity-2-4-attribute-schema-15}}

---

### Step 16

**Task:** Enable the schema for Real-Time Customer Profile.

**Detail:** In the Composition panel, click your **schema name** (not a field group). In the Schema properties pane on the right, click the **Profile** toggle to enable it. A confirmation dialog appears — click **Enable**. Click **Save**.

**Hint 1:** If the Profile toggle is greyed out, check that emailId is set as Primary Identity. The schema cannot be enabled for Profile without a primary identity.

**Hint 2:** This setting cannot be undone once data has been ingested against the schema.

**Expected result:** The Profile toggle shows enabled (blue). The schema is saved. Your schema is now ready to receive customer attribute data.

**Common mistake:** Forgetting to click Save after enabling for Profile.

{{img:activity-2-4-attribute-schema-16}}

---

## Activity Complete

Your `<firstname>-Customer Profile Schema` is now fully configured with:
- Class: XDM Individual Profile
- 8 standard field groups
- Custom identity field group with 4 identity fields
- emailId set as primary identity
- Schema enabled for Real-Time Customer Profile

**Next:** Activity 2.5 — Create an Event XDM Schema (the companion schema for behavioural/event data).

---

## Metadata

```yaml
activity: "2.4"
week: 2
type: literal_exercise
total_steps: 16
total_tasks: 4
images:
  - activity-2-4-attribute-schema-01: "Create schema dialog - Manual option selected"
  - activity-2-4-attribute-schema-02: "Select a class - Individual Profile selected"
  - activity-2-4-attribute-schema-03: "Name and review - schema display name entered"
  - activity-2-4-attribute-schema-04: "Schema created - XDM Individual Profile class shown"
  - activity-2-4-attribute-schema-05: "Add field groups - Composition panel Add button"
  - activity-2-4-attribute-schema-06: "Field groups selected in Add field groups dialog"
  - activity-2-4-attribute-schema-07: "Schema saved with field groups in Composition panel"
  - activity-2-4-attribute-schema-08: "Create new field group dialog"
  - activity-2-4-attribute-schema-09: "Custom field group selected, add field icon visible"
  - activity-2-4-attribute-schema-10: "Field properties - identification Object defined"
  - activity-2-4-attribute-schema-11: "Four sub-fields added under identification Object"
  - activity-2-4-attribute-schema-12: "ecid Identity checkbox and ECID namespace selected"
  - activity-2-4-attribute-schema-13: "emailId Primary Identity and Email namespace selected"
  - activity-2-4-attribute-schema-14: "emailIdSha256 Identity checkbox selected"
  - activity-2-4-attribute-schema-15: "mobilenr Identity and Phone namespace selected"
  - activity-2-4-attribute-schema-16: "Profile toggle enabled in Schema properties"
```
