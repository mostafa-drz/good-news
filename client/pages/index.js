import Head from "next/head";
import styles from "../styles/Home.module.css";
import fetch from "node-fetch";
import News from "../components/News";
import Navbar from "../components/Navbar";

export default function Home(props) {
  const { data } = props;

  return (
    <div className={styles.container}>
      <Head>
        <title>The Good News is</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
      </Head>
      <headr>
        <Navbar />
      </headr>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {data && data.map((d) => <News {...d} key={d.id} />)}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const {
    query: { sentiment },
  } = context;
  const sentiments = {
    positive: "POSITIVE",
    negative: "NEGATIVE",
    neutral: "NEUTRAL",
  };
  let sen = "POSITIVE";
  if (sentiments[sentiment]) {
    sen = sentiments[sentiment];
  }
  const resp = await fetch(
    `${process.env.API_URL}/api/results?Sentiment=${sen}`
  );
  const data = await resp.json();
  return {
    props: { data, count: data?.length },
  };
}
