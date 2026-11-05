const FOLDER_ID = "1x8Jp2-fUBaO5VasREU9NHP4npxcCKjTj";

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const token = PropertiesService.getScriptProperties().getProperty(
      "UPLOAD_TOKEN"
    );

    if (!token || body.token !== token) {
      return respond({ error: "Unauthorized" });
    }

    if (!body.data) {
      return respond({ error: "Data gambar kosong" });
    }

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const bytes = Utilities.base64Decode(body.data);
    const blob = Utilities.newBlob(
      bytes,
      body.mimeType || "image/jpeg",
      body.filename || "foto.jpg"
    );
    const file = folder.createFile(blob);

    file.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

    return respond({
      id: file.getId(),
      name: file.getName(),
      url:
        "https://drive.google.com/thumbnail?id=" +
        file.getId() +
        "&sz=w2000",
    });
  } catch (error) {
    return respond({ error: error.message });
  }
}

function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
