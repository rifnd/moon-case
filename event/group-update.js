import config from "../config.js"

export default async function GroupUpdate(conn, update) {
  try {
    for (const action of update) {
      // get profile picture group
      let profile
      try {
        profile = await conn.profilePictureUrl(action.id, "image")
      } catch {
        profile = "https://lh3.googleusercontent.com/proxy/esjjzRYoXlhgNYXqU8Gf_3lu6V-eONTnymkLzdwQ6F6z0MWAqIwIpqgq_lk4caRIZF_0Uqb5U8NWNrJcaeTuCjp7xZlpL48JDx-qzAXSTh00AVVqBoT7MJ0259pik9mnQ1LldFLfHZUGDGY=w1200-h630-p-k-no-nu"
      }

      // action
      if (action.announce) {
        conn.sendMessageModify(action.id, `Group has been Closed`, null, {
          largeThumb: true,
          thumbnail: profile,
          url: db.setting.link
        })
      } else if (!action.announce) {
        conn.sendMessageModify(action.id, `Group is opened`, null, {
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