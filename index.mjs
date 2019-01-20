import readYml from "./components/yml_reader";
import Pipe from "./components/pipe";
import addAsteriks from "./filters/addAsteriks";
import removeVovel from "./filters/removeVovel";
import addDashes from "./filters/addDashes";

const pipes = readYml("config.yml").pipes;

pipes.forEach(currentPipe => {
  const pipe = new Pipe({name: currentPipe.name, filters: currentPipe.filters.map(filter => eval(filter))});
  pipe.start("Hallo i bims");
})
