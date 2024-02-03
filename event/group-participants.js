import config from "../config.js"

export default async function GroupParticipants(conn, {
  id,
  participants,
  action
}) {
  try {
    const metadata = await conn.groupMetadata(id)

    // participants
    for (const jid of participants) {
      // get profile picture user
      let profile
      try {
        profile = await conn.profilePictureUrl(jid, "image")
      } catch {
        profile = "https://lh3.googleusercontent.com/proxy/esjjzRYoXlhgNYXqU8Gf_3lu6V-eONTnymkLzdwQ6F6z0MWAqIwIpqgq_lk4caRIZF_0Uqb5U8NWNrJcaeTuCjp7xZlpL48JDx-qzAXSTh00AVVqBoT7MJ0259pik9mnQ1LldFLfHZUGDGY=w1200-h630-p-k-no-nu"
      }

      // action
      if (action == "add") {
        if (!db.groups[id]?.welcome) return
        conn.sendMessageModify(id, `Welcome @${jid.split("@")[0]} to "${metadata.subject}"`, null, {
          largeThumb: true,
          thumbnail: profile,
          url: db.setting.link
        })
      } else if (action == "remove") {
        if (!db.groups[id]?.leave) return
        conn.sendMessageModify(id, `@${jid.split("@")[0]} Leaving From "${metadata.subject}"`, null, {
          largeThumb: true,
          thumbnail: profile,
          url: db.setting.link
        })
      }
    }
  } catch (e) {
    throw e
  }
}